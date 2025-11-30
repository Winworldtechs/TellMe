from django.contrib import admin
from django.utils.html import format_html
from .models import MostBooked

@admin.register(MostBooked)
class MostBookedAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:80px; height:80px; object-fit:cover; border-radius:10px;" />', obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'