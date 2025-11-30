# permissions.py

from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow read-only for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only if user owns the object
        return obj.provider.user == request.user
