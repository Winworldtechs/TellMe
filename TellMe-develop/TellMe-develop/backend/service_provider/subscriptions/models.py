from django.db import models
from django.conf import settings
from datetime import timedelta, date

User = settings.AUTH_USER_MODEL

# -------------------------------
# 1. Subscription Plan Model
# -------------------------------
class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    features = models.JSONField(default=dict, blank=True)  # Example: {"max_deals": 5}
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price} ({self.duration_days} days)"

    class Meta:
        ordering = ['price']
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"

    @staticmethod
    def seed_default_plans():
        default_plans = [
            {"name": "Basic 1 Month", "price": 250, "duration_days": 30},
            {"name": "Standard 2 Months", "price": 500, "duration_days": 60},
            {"name": "Premium 3 Months", "price": 700, "duration_days": 90},
            {"name": "Ultimate 9 Months", "price": 900, "duration_days": 270},
        ]
        for plan in default_plans:
            SubscriptionPlan.objects.get_or_create(
                name=plan["name"],
                defaults={
                    "price": plan["price"],
                    "duration_days": plan["duration_days"],
                    "description": f"{plan['name']} plan",
                    "features": {"max_deals": 5},
                    "is_active": True
                }
            )

# -------------------------------
# 2. Notification Log Model
# -------------------------------
class NotificationLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.type}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification Log"
        verbose_name_plural = "Notification Logs"

# -------------------------------
# 3. User Subscription Model
# -------------------------------
class UserSubscription(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('free_trial', 'Free Trial'),
        ('paid', 'Paid'),
        ('expired', 'Expired'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name="subscribers")
    start_date = models.DateField(default=date.today)
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='free_trial')

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.start_date + timedelta(days=self.plan.duration_days)

        if self.end_date and self.end_date < date.today():
            self.is_active = False
            self.payment_status = 'expired'

        super().save(*args, **kwargs)

        NotificationLog.objects.create(
            user=self.user,
            message=f"Your subscription to '{self.plan.name}' is now active until {self.end_date}.",
            type='Subscription'
        )

    def __str__(self):
        return f"{self.user} - {self.plan.name} ({self.payment_status})"

    class Meta:
        verbose_name = "User Subscription"
        verbose_name_plural = "User Subscriptions"