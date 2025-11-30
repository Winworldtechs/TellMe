# towing/admin.py

from django.contrib import admin
from .models import TowingProvider

@admin.register(TowingProvider)
class TowingProviderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'phone', 'charges', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'user__email', 'phone')