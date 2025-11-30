from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "currency", "payment_gateway", "status", "related", "created_at")
    list_editable = ("status",)
    search_fields = ("user__email", "gateway_payment_id", "status")
    list_filter = ("payment_gateway", "status", "created_at")
    readonly_fields = ("id", "gateway_payment_id", "created_at", "payment_gateway")
    date_hierarchy = "created_at"
    autocomplete_fields = ["user"]

    def related(self, obj):
        return obj.related_object or "-"
    related.short_description = "Linked To"