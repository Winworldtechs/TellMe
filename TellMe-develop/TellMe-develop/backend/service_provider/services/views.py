from rest_framework import generics, permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated


from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ServiceCategory, ServiceProvider, Service, Machinery, 
    Booking, MachineryBooking, Offer, OfferBooking,GroceryBooking,GroceryVendor,
)
from datetime import datetime, timedelta
from rest_framework.views import APIView
from .serializers import (
    ServiceCategorySerializer,
    ServiceProviderSerializer,
    ServiceSerializer,
    MachinerySerializer,
    MostBookedServiceSerializer,
    BookingSerializer,
    MachineryBookingSerializer,
    OfferSerializer,
    OfferBookingSerializer,
    ServiceCardSerializer
,GroceryBookingSerializer,

)
from rest_framework.pagination import PageNumberPagination
from math import radians, cos, sin, asin, sqrt


# ---------------------- PAGINATION ----------------------
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


# ---------------------- HAVERSINE DISTANCE ----------------------
def haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 999999
    lat1, lon1, lat2, lon2 = map(radians, map(float, [lat1, lon1, lat2, lon2]))
    dlon, dlat = lon2 - lon1, lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 6371 * 2 * asin(sqrt(a))


# ---------------------- CATEGORY VIEWS ----------------------
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = ServiceCategory.objects.all().order_by('title')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ---------------------- PROVIDER VIEWS ----------------------
class ProviderListView(generics.ListAPIView):
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'address', 'description']

    def get_queryset(self):
        qs = ServiceProvider.objects.select_related('category')
        lat, lng = self.request.query_params.get('lat'), self.request.query_params.get('lng')
        radius = float(self.request.query_params.get('radius', 10))
        category = self.request.query_params.get('category')
        q = self.request.query_params.get('q')

        if category:
            qs = qs.filter(Q(category__slug=category) | Q(category__id=category))
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(address__icontains=q) | Q(description__icontains=q))
        if lat and lng:
            try:
                lat_f, lng_f = float(lat), float(lng)
            except ValueError:
                return qs.none()
            providers = []
            for p in qs:
                dist = haversine_km(lat_f, lng_f, p.lat, p.lng) if p.lat and p.lng else 999999
                if dist <= radius:
                    setattr(p, 'distance_km', round(dist, 3))
                    providers.append(p)
            providers.sort(key=lambda x: getattr(x, 'distance_km', 999999))
            return providers
        return qs.order_by('-is_verified', '-created_at')


class ProviderCreateView(generics.CreateAPIView):
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProviderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceProvider.objects.select_related('category')
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        instance = self.get_object()

        # ✅ Only provider owner or admin can update
        if self.request.user != instance.user and not self.request.user.is_staff:
            raise PermissionError("Not allowed")

        # ✅ Allow provider to update open_time, close_time, and slot_interval
        updated = serializer.save()
        print(f"✅ Provider {updated.name} updated — Open: {updated.open_time}, Close: {updated.close_time}, Interval: {getattr(updated, 'slot_interval', 'N/A')}")

# ---------------------- SERVICE VIEWS ----------------------
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.select_related('provider').order_by('-created_at')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']


class ServiceCreateView(generics.CreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        provider = serializer.validated_data.get('provider')
        if provider.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Not allowed to create service for this provider")
        serializer.save()


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.select_related('provider')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        instance = self.get_object()
        if self.request.user != instance.provider.user and not self.request.user.is_staff:
            raise PermissionError("Not allowed")
        serializer.save()

# ---------------------- NEW VIEW: PROVIDERS BY SERVICE TITLE ----------------------
                                        

# ✅ NEW — GET PROVIDERS BY SERVICE TITLE
# ✅ Filter by category slug (not by title text)
class ProvidersByServiceSlugView(generics.ListAPIView):
    serializer_class = ServiceCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        slug = self.request.query_params.get("slug")

        if not slug:
            return Service.objects.none()

        # ✅ 1. Find category using slug
        from .models import ServiceCategory, Service
        try:
            category = ServiceCategory.objects.get(slug=slug)
        except ServiceCategory.DoesNotExist:
            return Service.objects.none()

        # ✅ 2. Filter only services whose provider belongs to that category
        return (
            Service.objects.filter(
                provider__category=category,
                is_active=True
            )
            .select_related("provider", "provider__category")
            .order_by("-created_at")
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context




# ---------------------- MACHINERY VIEWSET ----------------------
class MachineryViewSet(viewsets.ModelViewSet):
    queryset = Machinery.objects.all().order_by('-created_at')
    serializer_class = MachinerySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['provider_id', 'is_available', 'is_verified']
    search_fields = ['name', 'description']

    def perform_create(self, serializer):
        try:
            provider = self.request.user.providers.first()
            if not provider:
                return Response({"detail": "You must be a registered service provider to add machinery."},
                                status=status.HTTP_403_FORBIDDEN)
            serializer.save(provider=provider)
        except AttributeError:
            return Response({"detail": "User object does not have a provider profile."},
                            status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        provider_id = self.request.query_params.get('provider_id')
        qs = Machinery.objects.all().order_by('-created_at')
        return qs.filter(provider_id=provider_id) if provider_id else qs

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def available_machinery(self, request):
        queryset = self.get_queryset().filter(is_available=True, is_verified=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------- MOST BOOKED SERVICES ----------------------
class MostBookedServicesView(generics.ListAPIView):
    serializer_class = MostBookedServiceSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Service.objects.annotate(
            total_bookings=Count('standard_bookings')
        ).filter(
            total_bookings__gt=0
        ).order_by('-total_bookings')[:10]
        return queryset
    
# ---------------------- AVAILABLE SLOTS (Dynamic Slot Generator) ----------------------
class AvailableSlotsAPIView(APIView):
    """
    ✅ Generates available time slots for a provider dynamically.
    - Reads provider.open_time, provider.close_time, and provider.slot_interval (default 30 min)
    - Removes already booked slots
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from .models import ServiceProvider, Booking

        provider_id = request.query_params.get("provider_id")
        service_id = request.query_params.get("service_id")
        date_str = request.query_params.get("date")

        if not provider_id or not date_str:
            return Response({"error": "Missing provider_id or date"}, status=400)

        # ✅ Get Provider
        try:
            provider = ServiceProvider.objects.get(id=provider_id)
        except ServiceProvider.DoesNotExist:
            return Response({"error": "Provider not found"}, status=404)

        # ✅ Provider timings (defaults if empty)
        open_time = provider.open_time or datetime.strptime("09:00", "%H:%M").time()
        close_time = provider.close_time or datetime.strptime("18:00", "%H:%M").time()
        interval = getattr(provider, "slot_interval", 30)

        # ✅ Parse date
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        # ✅ Existing bookings for that provider & service on the selected date
        booked_slots = Booking.objects.filter(
            service_id=service_id,
            booking_time__date=date_obj
        ).values_list("booking_time", flat=True)

        booked_times = {b.strftime("%H:%M") for b in booked_slots}

        # ✅ Generate slots dynamically
        slots = []
        start_dt = datetime.combine(date_obj, open_time)
        end_dt = datetime.combine(date_obj, close_time)

        while start_dt + timedelta(minutes=interval) <= end_dt:
            end_dt_slot = start_dt + timedelta(minutes=interval)
            slot_label = f"{start_dt.strftime('%I:%M %p')} - {end_dt_slot.strftime('%I:%M %p')}"
            slot_code = start_dt.strftime("%H:%M")

            # skip booked slots
            if slot_code not in booked_times:
                slots.append({"label": slot_label})

            start_dt = end_dt_slot

        return Response({"slots": slots})



# ---------------------- OFFER VIEWS ----------------------
class OfferListCreateView(generics.ListCreateAPIView):
    queryset = Offer.objects.all().order_by('-created_at')
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ---------------------- OFFER BOOKING VIEWS ----------------------
class OfferBookingListCreateView(generics.ListCreateAPIView):
    queryset = OfferBooking.objects.all().order_by('-created_at')
    serializer_class = OfferBookingSerializer
    permission_classes = [permissions.AllowAny]


class OfferBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OfferBooking.objects.all()
    serializer_class = OfferBookingSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------- STANDARD BOOKING ----------------------
class BookingListCreateView(generics.ListCreateAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]




# ---------------------- MACHINERY BOOKING ----------------------
class MachineryBookingListCreateView(generics.ListCreateAPIView):
    queryset = MachineryBooking.objects.all().order_by('-created_at')
    serializer_class = MachineryBookingSerializer
    permission_classes = [permissions.AllowAny]


class MachineryBookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MachineryBooking.objects.all()
    serializer_class = MachineryBookingSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------- GROCERY VENDORS LIST ----------------------
class GroceryVendorListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from .models import GroceryVendor

        category = request.GET.get("category")  # fruits / vegetables / all

        if category and category != "all":
            vendors = GroceryVendor.objects.filter(categories__contains=[category])
        else:
            vendors = GroceryVendor.objects.all()

        data = [{
            "id": v.id,
            "name": v.name,
            "slug": v.slug,
            "image_url": request.build_absolute_uri(v.image.url) if v.image else "",
            "rating": v.rating,
            "distance": v.distance,
            "categories": v.categories
        } for v in vendors]

        return Response(data)


# ---------------------- GROCERY ITEMS (POPUP DATA) ----------------------
class GroceryVendorItemsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug, *args, **kwargs):
        from .models import GroceryVendor

        try:
            vendor = GroceryVendor.objects.get(slug=slug)
        except GroceryVendor.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=404)

        items = vendor.items.all()

        data = [{
            "id": i.id,
            "name": i.name,
            "type": i.type,
            "image_url": request.build_absolute_uri(i.image.url) if i.image else "",
            "price_per_kg": i.price_per_kg,
        } for i in items]

        return Response(data)
# ---------------------- GROCERY BOOKING VIEW ----------------------


class GroceryBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            user = request.user

            # React payload matching
            vendor_id = request.data.get("vendorId")
            items = request.data.get("items", [])
            total_qty = request.data.get("totalQty", 0)
            total_price = request.data.get("totalPrice", 0)

            if not vendor_id:
                return Response({"error": "Vendor ID required"}, status=400)

            vendor = GroceryVendor.objects.get(id=vendor_id)

            # Create booking
            booking = GroceryBooking.objects.create(
                user=user,
                vendor=vendor,
                items=items,
                total_qty=total_qty,
                total_price=total_price,
                status="pending",
            )

            serializer = GroceryBookingSerializer(booking)

            return Response(
                {
                    "message": "Booking created successfully",
                    "booking_id": booking.id,
                    "data": serializer.data
                },
                status=201
            )

        except GroceryVendor.DoesNotExist:
            return Response({"error": "Invalid vendor"}, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)