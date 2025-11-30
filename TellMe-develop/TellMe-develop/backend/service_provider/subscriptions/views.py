from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import SubscriptionPlan, UserSubscription, NotificationLog
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, NotificationLogSerializer

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAdminUser]

class UserSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-subscription')
    def my_subscription(self, request):
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not subscription:
            return Response({'detail': 'No active subscription'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='subscribe')
    def subscribe(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            raise ValidationError("Missing plan_id")

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise ValidationError("Invalid or inactive plan")

        if UserSubscription.objects.filter(user=request.user, is_active=True).exists():
            return Response({"detail": "You already have an active subscription."}, status=status.HTTP_400_BAD_REQUEST)

        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=plan.duration_days)

        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            payment_status='paid'
        )

        NotificationLog.objects.create(
            user=request.user,
            message=f"Your subscription to '{plan.name}' is now active until {end_date}.",
            type='Subscription'
        )

        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAdminUser]