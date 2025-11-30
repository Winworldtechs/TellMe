from django.db import models
import uuid


class BarcodeOrder(models.Model):
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name="barcode_orders")
    type = models.CharField(max_length=50)  # e.g., car, home, electronic, bike, laptop, phone
    company = models.CharField(max_length=255, blank=True)
    model = models.CharField(max_length=255, blank=True)
    owner_name = models.CharField(max_length=255, blank=True)
    notifications = models.JSONField(default=dict)

    barcode_code = models.CharField(max_length=100, unique=True, blank=True)
    is_registered = models.BooleanField(default=False)

    # ----------- PAYMENT FIELDS -----------
    price = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=20, blank=True, null=True)
    payment_id = models.CharField(max_length=255, blank=True, null=True)
    payment_status = models.CharField(max_length=50, default="pending")  # pending/completed/failed

    # ⭐ NEW FIELD (IMPORTANT FOR RAZORPAY) ⭐
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)

    # ----------- SCANNER STATS -----------
    last_scanned_at = models.DateTimeField(blank=True, null=True)
    scan_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.barcode_code:
            self.barcode_code = str(uuid.uuid4().hex[:10]).upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.type} - {self.barcode_code}"


# -------------------------
# Type-specific detail tables
# -------------------------

class CarDetail(models.Model):
    barcode_order = models.OneToOneField(BarcodeOrder, on_delete=models.CASCADE, related_name="car_detail")
    registration_number = models.CharField(max_length=50, blank=True)
    fuel_type = models.CharField(max_length=50, blank=True)
    seating_capacity = models.PositiveIntegerField(blank=True, null=True)
    color = models.CharField(max_length=50, blank=True)
    year = models.PositiveIntegerField(blank=True, null=True)

    enable_no_parking_reports = models.BooleanField(default=True)
    enable_sale_listing = models.BooleanField(default=False)
    enable_rent_listing = models.BooleanField(default=False)


class HomeDetail(models.Model):
    barcode_order = models.OneToOneField(BarcodeOrder, on_delete=models.CASCADE, related_name="home_detail")
    address = models.TextField(blank=True)
    property_type = models.CharField(max_length=50, blank=True)
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    enable_report_complaint = models.BooleanField(default=True)
    enable_sale_listing = models.BooleanField(default=False)
    enable_rent_listing = models.BooleanField(default=False)


class ElectronicDetail(models.Model):
    barcode_order = models.OneToOneField(BarcodeOrder, on_delete=models.CASCADE, related_name="electronic_detail")
    serial_number = models.CharField(max_length=255, blank=True)
    warranty_till = models.DateField(null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)

    enable_service_request = models.BooleanField(default=True)
    enable_sale_listing = models.BooleanField(default=False)
    enable_rent_listing = models.BooleanField(default=False)


class Listing(models.Model):
    barcode_order = models.ForeignKey(BarcodeOrder, on_delete=models.CASCADE, related_name="listings")
    listing_type = models.CharField(max_length=10, choices=[("sale", "Sale"), ("rent", "Rent")])
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Interest(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="interests")
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True)
    contact = models.CharField(max_length=100, blank=True)
    message = models.TextField(blank=True)
    offered_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("new", "New"), ("accepted", "Accepted"), ("rejected", "Rejected")],
        default="new"
    )


class ViolationReport(models.Model):
    barcode_order = models.ForeignKey(BarcodeOrder, on_delete=models.CASCADE, related_name="violation_reports")
    reporter = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    violation_type = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to="violations/", blank=True, null=True)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
