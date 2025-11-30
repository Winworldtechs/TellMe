from django.contrib import admin
from .models import CarPoolingVendor


@admin.register(CarPoolingVendor)
class CarPoolingVendorAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "rating", "distance", "is_available")
    search_fields = ("name", "phone")
    list_filter = ("is_available",)
