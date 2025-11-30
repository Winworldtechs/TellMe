from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import razorpay
from razorpay.errors import SignatureVerificationError

from .models import BarcodeOrder, Listing, Interest, ViolationReport
from .serializers import BarcodeOrderSerializer, ListingSerializer


# ===============================================================
# Razorpay Client + Debug
# ===============================================================
def get_razorpay_client():
    print("\n========== RAZORPAY DEBUG ==========")
    print("RAZORPAY_KEY_ID     =", settings.RAZORPAY_KEY_ID)
    print("RAZORPAY_KEY_SECRET =", settings.RAZORPAY_KEY_SECRET)
    print("====================================\n")

    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class BarcodeOrderViewSet(viewsets.ModelViewSet):
    serializer_class = BarcodeOrderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["type", "company", "model", "owner_name", "barcode_code"]
    ordering_fields = ["created_at", "updated_at"]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            return BarcodeOrder.objects.filter(owner=user)
        return BarcodeOrder.objects.none()

    # ===============================================================
    # CREATE ORDER (Before payment)
    # ===============================================================
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save(owner=request.user)

        return Response(
            {"id": order.id, "message": "Order created. Proceed to payment."},
            status=status.HTTP_201_CREATED,
        )

    # ===============================================================
    # CREATE RAZORPAY ORDER
    # ===============================================================
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def create_razorpay_order(self, request, pk=None):
        order = self.get_object()
        client = get_razorpay_client()

        amount_rupees = float(order.price or 200.0)
        amount_paise = int(amount_rupees * 100)

        print("Creating Razorpay order for:", amount_paise, "paise")

        try:
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"barcode_{order.id}",
                "payment_capture": 1,
            })
        except Exception as e:
            print("\n❌ Razorpay ERROR ❌")
            print("Error =", str(e))
            print("====================================\n")
            return Response(
                {"detail": "Razorpay authentication failed", "error": str(e)},
                status=500,
            )

        order.razorpay_order_id = razorpay_order["id"]
        order.save(update_fields=["razorpay_order_id"])

        return Response({
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key": settings.RAZORPAY_KEY_ID
        })

    # ===============================================================
    # VERIFY PAYMENT
    # ===============================================================
    @action(detail=True, methods=["post"])
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        client = get_razorpay_client()

        payment_id = request.data.get("razorpay_payment_id")
        razorpay_order_id = request.data.get("razorpay_order_id") or order.razorpay_order_id
        signature = request.data.get("razorpay_signature")

        if not (payment_id and razorpay_order_id and signature):
            return Response({"detail": "Missing payment details"}, status=400)

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature
            })
        except SignatureVerificationError:
            return Response({"detail": "Signature verification failed!"}, status=400)

        order.is_paid = True
        order.payment_status = "completed"
        order.payment_id = payment_id
        order.save(update_fields=["is_paid", "payment_status", "payment_id"])

        return Response({"message": "Payment verified successfully!"})

    # ===============================================================
    # SCANNER API
    # ===============================================================
    @action(detail=False, methods=["get"], url_path="by_code", permission_classes=[permissions.AllowAny])
    def get_by_code(self, request):
        code = request.query_params.get("code")
        if not code:
            return Response({"detail": "code required"}, status=400)

        try:
            order = BarcodeOrder.objects.get(barcode_code=code)
        except BarcodeOrder.DoesNotExist:
            return Response({"detail": "Barcode not found"}, status=404)

        order.scan_count += 1
        order.last_scanned_at = timezone.now()
        order.save(update_fields=["scan_count", "last_scanned_at"])

        return Response({
            "barcode": BarcodeOrderSerializer(order).data,
            "listings": ListingSerializer(
                Listing.objects.filter(barcode_order=order, is_active=True),
                many=True,
            ).data,
        })

    # ===============================================================
    # OTHER API (No change)
    # ===============================================================
    @action(detail=True, methods=["post"])
    def report_no_parking(self, request, pk=None):
        order = self.get_object()
        if order.type.lower() != "car":
            return Response({"detail": "Not applicable"}, status=400)

        report = ViolationReport.objects.create(
            barcode_order=order,
            reporter=request.user if request.user.is_authenticated else None,
            violation_type="no_parking",
            description=request.data.get("description", "")
        )

        return Response({"detail": "No-parking report submitted", "id": report.id})

    @action(detail=True, methods=["post"])
    def express_interest(self, request, pk=None):
        data = request.data

        try:
            listing = Listing.objects.get(id=data.get("listing_id"), is_active=True)
        except Listing.DoesNotExist:
            return Response({"detail": "Listing not found"}, status=404)

        interest = Interest.objects.create(
            listing=listing,
            user=request.user if request.user.is_authenticated else None,
            name=data.get("name", ""),
            contact=data.get("contact", ""),
            message=data.get("message", ""),
            offered_price=data.get("offered_price"),
        )

        return Response({"detail": "Interest added", "id": interest.id})

    @action(detail=True, methods=["post"])
    def create_listing(self, request, pk=None):
        order = self.get_object()

        if request.user != order.owner:
            return Response({"detail": "Not allowed"}, status=403)

        listing = Listing.objects.create(
            barcode_order=order,
            listing_type=request.data.get("listing_type"),
            price=request.data.get("price"),
            description=request.data.get("description", "")
        )

        return Response({"detail": "Listing created", "id": listing.id}, status=201)
