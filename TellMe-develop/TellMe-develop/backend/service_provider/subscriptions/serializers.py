from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, UserSubscription, NotificationLog

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"

class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = "__all__"

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.filter(is_active=True),
        source="plan",
        write_only=True
    )

    class Meta:
        model = UserSubscription
        fields = [
            "id", "user", "plan", "plan_id",
            "start_date", "end_date", "is_active", "payment_status"
        ]
        read_only_fields = ["id", "start_date", "end_date", "is_active", "payment_status"]

    def validate(self, attrs):
        user = self.context["request"].user
        if UserSubscription.objects.filter(user=user, is_active=True).exists():
            raise serializers.ValidationError("You already have an active subscription.")
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        plan = validated_data["plan"]

        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=plan.duration_days)

        subscription = UserSubscription.objects.create(
            user=user,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            payment_status='free_trial'
        )

        NotificationLog.objects.create(
            user=user,
            message=f"Your subscription to '{plan.name}' is now active until {end_date}.",
            type='Subscription'
        )

        return subscription