from django.urls import path
from .views import BookingListCreateView, BookingDetailView, AvailableSlotsAPIView

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),
]
