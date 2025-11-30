# towing/urls.py

from django.urls import path
from .views import TowingProviderListCreateView, TowingProviderDetailView

urlpatterns = [
    path('', TowingProviderListCreateView.as_view(), name='towing-list-create'),
    path('<uuid:pk>/', TowingProviderDetailView.as_view(), name='towing-detail'),
]