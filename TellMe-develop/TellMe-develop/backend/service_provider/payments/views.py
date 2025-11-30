from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Payment
from .serializers import PaymentSerializer
from rest_framework import serializers
import stripe, os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        payment = serializer.save(user=self.request.user, payment_gateway="stripe")
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(payment.amount * 100),
                currency=payment.currency.lower(),
                metadata={"payment_id": str(payment.id)},
            )
            payment.gateway_payment_id = intent["id"]
            payment.save()
        except stripe.error.StripeError as e:
            raise serializers.ValidationError({"stripe": str(e)})
        return payment

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def webhook(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        intent = event["data"]["object"]
        payment_id = intent["metadata"].get("payment_id")

        try:
            payment = Payment.objects.get(id=payment_id)
            if event["type"] == "payment_intent.succeeded":
                payment.status = "success"
            elif event["type"] == "payment_intent.payment_failed":
                payment.status = "failed"
            payment.save()
        except Payment.DoesNotExist:
            pass

        return Response({"status": "ok"})