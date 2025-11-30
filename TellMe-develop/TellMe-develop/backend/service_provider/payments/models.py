from django.db import models
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL

class Payment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    payment_gateway = models.CharField(max_length=50, default="stripe")  # or payu
    gateway_payment_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    related_object = models.CharField(max_length=100, blank=True, null=True)  # e.g. booking:123, deal:456
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - ₹{self.amount} ({self.status})"