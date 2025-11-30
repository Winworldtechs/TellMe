# barcodes/admin.py

from django.contrib import admin
from django.http import HttpResponse
from .models import BarcodeOrder, CarDetail, HomeDetail, ElectronicDetail, Listing, Interest, ViolationReport
import io
import qrcode
from reportlab.pdfgen import canvas

# --------------------
# Barcode Order Admin
# --------------------
@admin.register(BarcodeOrder)
class BarcodeOrderAdmin(admin.ModelAdmin):
    list_display = ("barcode_code", "owner", "type", "is_paid", "created_at")
    list_filter = ("type", "is_paid")
    search_fields = ("barcode_code", "owner__email", "type")

    actions = ["export_barcodes"]

    def export_barcodes(self, request, queryset):
        """
        Admin action: Export selected barcodes as PDF (for printing and drop)
        """
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer)

        y = 800
        for order in queryset:
            # generate QR/barcode image
            qr = qrcode.make(order.barcode_code)
            qr_buffer = io.BytesIO()
            qr.save(qr_buffer, format="PNG")
            qr_buffer.seek(0)

            # add barcode + text into PDF
            pdf.drawImage(qr_buffer, 50, y-100, width=100, height=100)
            pdf.drawString(200, y-50, f"Barcode: {order.barcode_code}")
            pdf.drawString(200, y-70, f"Owner: {order.owner.email}")
            pdf.drawString(200, y-90, f"Type: {order.type}")

            y -= 150
            if y < 100:
                pdf.showPage()
                y = 800

        pdf.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="barcodes.pdf"'
        return response

    export_barcodes.short_description = "Export selected barcodes as PDF"


# --------------------
# Register Other Models (optional)
# --------------------
@admin.register(CarDetail)
class CarDetailAdmin(admin.ModelAdmin):
    list_display = ("barcode_order", "registration_number", "fuel_type", "year")


@admin.register(HomeDetail)
class HomeDetailAdmin(admin.ModelAdmin):
    list_display = ("barcode_order", "property_type", "area_sqft")


@admin.register(ElectronicDetail)
class ElectronicDetailAdmin(admin.ModelAdmin):
    list_display = ("barcode_order", "serial_number", "warranty_till")


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("barcode_order", "listing_type", "price", "currency", "is_active", "created_at")


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ("listing", "user", "name", "status", "created_at")


@admin.register(ViolationReport)
class ViolationReportAdmin(admin.ModelAdmin):
    list_display = ("barcode_order", "violation_type", "reporter", "created_at", "processed")
