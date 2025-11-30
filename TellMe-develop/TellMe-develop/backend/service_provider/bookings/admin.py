from django.contrib import admin
from .models import Booking
@admin.register(Booking)

class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'service', 'provider', 'date', 'start_time', 'end_time', 'status', 'price')
    list_filter = ('status', 'date', 'provider')
    search_fields = ('user__email', 'service__title', 'provider__name')
    readonly_fields = ('created_at',)
    date_hierarchy = 'date'
    autocomplete_fields = ['user', 'service', 'provider']

    def save_model(self, request, obj, form, change):
        if not obj.price and obj.service:
            obj.price = obj.service.price
        super().save_model(request, obj, form, change)