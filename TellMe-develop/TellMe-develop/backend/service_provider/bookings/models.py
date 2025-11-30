from django.db import models
from django.conf import settings
from services.models import Service, ServiceProvider
from django.utils import timezone

BOOKING_CATEGORIES = [
    ('salon', 'Salon'),
    ('clinic', 'Clinic'),
    ('car_wash', 'Car Wash'),
    ('bike_wash', 'Bike Wash'),
    ('car_service', 'Car Service'),
    ('bike_service', 'Bike Service'),
    ('home_service', 'Home Service'),
    ('towing', 'Towing'),
    ('sos', 'Emergency Help'),
    ('subscription', 'Subscription Plan'),
]
class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # optional: reference to payment / coupon etc.

    class Meta:
        ordering = ['-date', '-start_time']
        indexes = [
            models.Index(fields=['provider', 'date']),
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"Booking #{self.id} {self.service.title} on {self.date} {self.start_time}-{self.end_time} ({self.status})"

    def overlaps(self, other_start_time, other_end_time):
        """
        Check if this booking overlaps with [other_start_time, other_end_time).
        Times are datetime.time objects.
        Overlap logic: two intervals [a,b) and [c,d) overlap if a < d and c < b
        """
        a = self.start_time
        b = self.end_time
        c = other_start_time
        d = other_end_time
        return (a < d) and (c < b)