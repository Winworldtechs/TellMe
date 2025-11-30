from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationLogViewSet

router = DefaultRouter()
router.register(r'', NotificationLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]