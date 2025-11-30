from django.contrib import admin
from .models import Deal, InterestedDeal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'category', 'rate', 'is_active', 'paid_until', 'created_at')
    list_filter = ('is_active', 'category', 'paid_until')
    search_fields = ('title', 'description', 'location', 'phone', 'email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(InterestedDeal)
class InterestedDealAdmin(admin.ModelAdmin):
    list_display = ('user', 'deal', 'created_at')
    search_fields = ('user__username', 'deal__title')
    list_filter = ('created_at',)
