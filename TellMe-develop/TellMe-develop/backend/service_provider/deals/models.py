from django.db import models
from django.conf import settings


class Deal(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='deals'
    )
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    image = models.ImageField(upload_to='deal_images/', blank=True, null=True)

    rate = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    paid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title



# ⭐ NEW MODEL: Save which user is interested in which deal
class InterestedDeal(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interested_deals'
    )
    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        related_name='interests'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'deal')  # Prevent multiple interests
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} interested in {self.deal.title}"
