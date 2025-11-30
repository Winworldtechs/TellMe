from django.db import models
from django.conf import settings
from services.models import Service


class SavedService(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'service')

    def __str__(self):
        return f"{self.user} saved {self.service}"
