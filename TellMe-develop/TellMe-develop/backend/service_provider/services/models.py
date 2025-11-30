from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User


# ---------------------- SERVICE CATEGORY ----------------------
class ServiceCategory(models.Model):
    slug = models.SlugField(unique=True, max_length=120)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"

    def __str__(self):
        return self.title


class ServiceProvider(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='providers')
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, related_name='providers')
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='providers/logos/', null=True, blank=True)
    address = models.TextField(blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # ✅ These three are the keys for dynamic slot generation
    open_time = models.TimeField(null=True, blank=True, help_text="Provider opening time (e.g. 09:00 AM)")
    close_time = models.TimeField(null=True, blank=True, help_text="Provider closing time (e.g. 06:00 PM)")
    slot_interval = models.PositiveIntegerField(default=30, help_text="Slot duration in minutes")

    open_days = models.JSONField(default=list, blank=True)
    charges = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    @property
    def logo_url(self):
        return self.logo.url if self.logo else ""



# ---------------------- STANDARD SERVICE ----------------------
class Service(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    slot_interval = models.PositiveIntegerField(default=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.provider.name}"

    @property
    def logo_url(self):
        if self.provider.logo:
            return self.provider.logo.url
        return ''


# ---------------------- MACHINERY MODEL ----------------------
class Machinery(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='machinery')
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, related_name='machineries')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    rental_cost_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Machinery"
        verbose_name_plural = "Machineries"

    def __str__(self):
        return f"{self.name} ({self.provider.name})"

    @property
    def logo_url(self):
        if self.provider.logo:
            return self.provider.logo.url
        return ''


# ---------------------- STANDARD BOOKING ----------------------
class Booking(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='standard_bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='service_bookings')
    booking_time = models.DateTimeField()
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Standard Booking"
        verbose_name_plural = "Standard Bookings"
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} for {self.service.title}"


# ---------------------- MACHINERY BOOKING ----------------------
class MachineryBooking(models.Model):
    machinery = models.ForeignKey(Machinery, on_delete=models.CASCADE, related_name='rentals')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='machinery_rentals')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Machinery Rental Booking"
        verbose_name_plural = "Machinery Rental Bookings"
        ordering = ['-created_at']

    def __str__(self):
        return f"Rental {self.id} for {self.machinery.name}"


# ---------------------- OFFER MODEL ----------------------
class Offer(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='offers', null=True, blank=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='offers/', blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Offer"
        verbose_name_plural = "Offers"

    def __str__(self):
        return self.title


# ---------------------- OFFER BOOKING ----------------------
class OfferBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='bookings')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    booking_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Offer Booking"
        verbose_name_plural = "Offer Bookings"
        ordering = ['-created_at']

    def __str__(self):
        return f"Offer Booking #{self.id} - {self.name} - {self.offer.title}"
    

    # ---------------------- GROCERY VENDOR (FRUITS & VEGETABLES) ----------------------
class GroceryVendor(models.Model):
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name="grocery_vendors")

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    # Fruits / Vegetables / Both
    categories = models.JSONField(default=list)

    rating = models.FloatField(default=4.5)
    distance = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to="vendors/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.name.lower().replace(" ", "-")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------------------- GROCERY ITEM ----------------------
class GroceryItem(models.Model):
    vendor = models.ForeignKey(GroceryVendor, on_delete=models.CASCADE, related_name="items")

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50)  # fruit / vegetable
    price_per_kg = models.FloatField()
    image = models.ImageField(upload_to="grocery_items/", null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.vendor.name})"
    

class GroceryBooking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vendor = models.ForeignKey(GroceryVendor, on_delete=models.CASCADE)
    items = models.JSONField(default=list)
    total_qty = models.FloatField(default=0)
    total_price = models.FloatField(default=0)
    status = models.CharField(max_length=20, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
