from django.urls import path
from .views import MostBookedListAPIView, MostBookedDetailAPIView

app_name = "mostbooked"

urlpatterns = [
    # ✅ List API → /api/most-booked/
    path('most-booked/', MostBookedListAPIView.as_view(), name='mostbooked-list'),

    # ✅ Detail API → /api/most-booked/<id>/
    path('most-booked/<int:pk>/', MostBookedDetailAPIView.as_view(), name='mostbooked-detail'),
]
