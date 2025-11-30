from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    # Table me kaunse columns dikhane hain
    list_display = (
        'email', 'username', 'phone', 'city', 'state', 'pincode',
        'is_provider', 'is_towing', 'is_active', 'is_staff', 'is_superuser'
    )
    list_filter = ('is_provider', 'is_towing', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'phone', 'city', 'state')
    ordering = ('email',)

    # Detail/Edit page me fields ka group
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {
            'fields': ('username', 'phone', 'city', 'state', 'pincode')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Roles', {
            'fields': ('is_provider', 'is_towing')
        }),
        ('Important dates', {'fields': ('last_login',)}),
    )

    # User add karte time form me fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'phone', 'city', 'state', 'pincode',
                'password1', 'password2', 'is_provider', 'is_towing',
                'is_active', 'is_staff', 'is_superuser'
            ),
        }),
    )