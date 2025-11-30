from django.db import models
from django.conf import settings
import uuid

User = settings.AUTH_USER_MODEL
NOTIFICATION_TYPES = [

('booking', 'Booking'),

('deal', 'Deal'),

('payment', 'Payment'),

('sos', 'Emergency Alert'),

('general', 'General'),
]

class NotificationLog(models.Model):
    TYPE_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications')
    notif_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    provider_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notif_type} -> {self.title or self.message[:30]} ({self.status})"