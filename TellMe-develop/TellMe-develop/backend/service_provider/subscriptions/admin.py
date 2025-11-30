from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, NotificationLog

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'duration_days', 'is_active']
    search_fields = ['name']
    list_filter = ['is_active']
    list_editable = ['is_active']
    ordering = ['price']
    readonly_fields = ['id']

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'start_date', 'end_date', 'is_active', 'payment_status']
    list_filter = ['payment_status', 'is_active']
    search_fields = ['user__email', 'plan__name']
    date_hierarchy = 'start_date'
    list_select_related = ['user', 'plan']
    readonly_fields = ['start_date', 'end_date']

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'message', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['user__email', 'message']
    date_hierarchy = 'created_at'
    list_select_related = ['user']
    readonly_fields = ['created_at']