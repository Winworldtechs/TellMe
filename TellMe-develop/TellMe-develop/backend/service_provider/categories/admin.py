from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "slug", "title")
    search_fields = ("slug", "title")
    prepopulated_fields = {"slug": ("title",)}