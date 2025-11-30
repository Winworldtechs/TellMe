from django.contrib import admin
from .models import NotificationLog

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'notif_type', 'title', 'status', 'created_at', 'sent_at')
    search_fields = ('title', 'message', 'user__email')
    list_filter = ('notif_type', 'status', 'created_at')