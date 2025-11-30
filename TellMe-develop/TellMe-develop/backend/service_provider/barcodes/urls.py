# barcodes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BarcodeOrderViewSet

router = DefaultRouter()
router.register(r'orders', BarcodeOrderViewSet, basename="barcode-orders")

urlpatterns = [
    path('', include(router.urls)),
]
