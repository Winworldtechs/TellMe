from django.db import models


class CarPoolingVendor(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    distance = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to="carpool_vendors/", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
