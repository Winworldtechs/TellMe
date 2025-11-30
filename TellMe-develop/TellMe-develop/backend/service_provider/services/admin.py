from django.contrib import admin
from .models import (
    ServiceCategory,
    Service,
    ServiceProvider,
    Machinery,
    Booking,
    MachineryBooking,
    Offer,
    OfferBooking,GroceryVendor, GroceryItem,
)


# ---------------------- SERVICE CATEGORY ----------------------
@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug')
    search_fields = ('title', 'slug')


# ---------------------- SERVICE ----------------------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'price', 'duration_minutes', 'is_active')
    list_filter = ('is_active', 'provider')
    search_fields = ('title', 'provider__name')


# ---------------------- SERVICE PROVIDER ----------------------
@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'user',
        'category',
        'open_time',
        'close_time',
        'slot_interval',   # ✅ Added for slot control
        'is_verified'
    )
    list_filter = ('is_verified', 'category')
    search_fields = ('name', 'user__email', 'category__title')
    readonly_fields = ('created_at', 'updated_at')

    # ✅ Grouped field layout (for better admin panel view)
    fieldsets = (
        ("Basic Info", {
            "fields": (
                'user',
                'category',
                'name',
                'logo',
                'address',
                'description'
            )
        }),
        ("Location & Timing", {
            "fields": (
                'lat',
                'lng',
                'open_time',
                'close_time',
                'slot_interval',  # ✅ Slot interval added here
                'open_days',
                'charges'
            )
        }),
        ("Verification & Metadata", {
            "fields": ('is_verified', 'created_at', 'updated_at')
        }),
    )


# ---------------------- MACHINERY ----------------------
@admin.register(Machinery)
class MachineryAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'rental_cost_per_hour', 'is_available', 'is_verified')
    list_filter = ('is_available', 'is_verified', 'provider')
    search_fields = ('name', 'provider__name')


# ---------------------- STANDARD BOOKING ----------------------
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin view for standard service bookings."""
    list_display = ('service', 'user', 'booking_time', 'status', 'created_at')
    list_filter = ('status', 'service', 'booking_time')
    search_fields = ('service__title', 'user__email')
    readonly_fields = ('created_at',)


# ---------------------- MACHINERY BOOKING ----------------------
@admin.register(MachineryBooking)
class MachineryBookingAdmin(admin.ModelAdmin):
    """Admin view for machinery rental bookings."""
    list_display = ('machinery', 'user', 'start_time', 'end_time', 'status', 'created_at')
    list_filter = ('status', 'machinery', 'start_time')
    search_fields = ('machinery__name', 'user__email')
    readonly_fields = ('created_at',)


# ---------------------- OFFERS ----------------------
@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    """Admin view for special offers."""
    list_display = ('title', 'provider', 'is_active', 'start_date', 'end_date', 'created_at')
    list_filter = ('is_active', 'provider', 'start_date', 'end_date')
    search_fields = ('title', 'subtitle', 'description', 'provider__name')
    readonly_fields = ('created_at',)


# ---------------------- OFFER BOOKINGS ----------------------
@admin.register(OfferBooking)
class OfferBookingAdmin(admin.ModelAdmin):
    """Admin view for offer bookings."""
    list_display = ('offer', 'name', 'email', 'phone', 'booking_date', 'status', 'created_at')
    list_filter = ('status', 'offer', 'booking_date')
    search_fields = ('offer__title', 'name', 'email', 'phone')
    readonly_fields = ('created_at',)

# ---------------------- GROCERY VENDOR ----------------------
@admin.register(GroceryVendor)
class GroceryVendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'provider', 'rating', 'distance', 'created_at')
    list_filter = ('provider',)
    search_fields = ('name', 'provider__name')
    readonly_fields = ('created_at',)


# ---------------------- GROCERY ITEM ----------------------
@admin.register(GroceryItem)
class GroceryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'type', 'price_per_kg')
    list_filter = ('vendor', 'type')
    search_fields = ('name', 'vendor__name')

# ---------------------- GROCERY BOOKING ----------------------
from .models import GroceryBooking

@admin.register(GroceryBooking)
class GroceryBookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "vendor",
        "total_qty",
        "total_price",
        "status",
        "created_at",
    )

    list_filter = ("status", "vendor")

    search_fields = ("user__username", "vendor__name")

    readonly_fields = ("created_at",)

