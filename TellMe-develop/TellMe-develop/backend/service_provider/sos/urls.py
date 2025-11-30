from django.urls import path
from .views import CarPoolingVendorListCreateView, CarPoolingVendorDetailView

urlpatterns = [
    path("carpool/vendors/", CarPoolingVendorListCreateView.as_view(), name="carpool-vendors"),
    path("carpool/vendors/<int:pk>/", CarPoolingVendorDetailView.as_view(), name="carpool-vendor-detail"),
]
