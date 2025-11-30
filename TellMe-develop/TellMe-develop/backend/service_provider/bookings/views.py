from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from datetime import datetime, date, time, timedelta
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from services.models import Service, ServiceProvider

# -------- SLOT GENERATION & BOOKING -------- #

def overlaps_any(existing_bookings, start_time, end_time):
    for b in existing_bookings:
        if b.overlaps(start_time, end_time):
            return True
    return False


def generate_time_slots(provider: ServiceProvider, service: Service, target_date: date):
    """Generate time slots dynamically based on provider & service duration."""
    if provider.open_time and provider.close_time:
        day_start = datetime.combine(target_date, provider.open_time)
        day_end = datetime.combine(target_date, provider.close_time)
    else:
        # Default time range (6 AM to 10 PM)
        day_start = datetime.combine(target_date, time(6, 0))
        day_end = datetime.combine(target_date, time(22, 0))

    # Duration = actual service duration
    duration = timedelta(minutes=service.duration_minutes or 30)
    # Interval = custom slot interval if defined, else use same as duration
    slot_interval = timedelta(minutes=service.slot_interval or service.duration_minutes or 30)

    # Existing bookings (skip cancelled)
    existing = Booking.objects.filter(
        provider=provider, date=target_date
    ).exclude(status=Booking.STATUS_CANCELLED)

    slots = []
    current = day_start
    last_start = day_end - duration

    while current <= last_start:
        slot_start = current
        slot_end = slot_start + duration
        if not overlaps_any(existing, slot_start.time(), slot_end.time()):
            slots.append({
                "start_time": slot_start.time(),
                "end_time": slot_end.time(),
                "label": f"{slot_start.strftime('%I:%M %p')} - {slot_end.strftime('%I:%M %p')}"
            })
        current += slot_interval

    return slots


class AvailableSlotsAPIView(APIView):
    """API to fetch available slots for given provider, service, and date"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        provider_id = request.query_params.get('provider_id')
        service_id = request.query_params.get('service_id')
        date_str = request.query_params.get('date')

        if not (provider_id and service_id and date_str):
            return Response({"detail": "provider_id, service_id and date are required"}, status=400)

        provider = get_object_or_404(ServiceProvider, pk=provider_id)
        service = get_object_or_404(Service, pk=service_id)
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()

        slots = generate_time_slots(provider, service, target_date)
        return Response({"slots": slots})


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer
    queryset = Booking.objects.all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.user != user and not user.is_staff and obj.provider.user != user:
            raise PermissionDenied("Not allowed")
        return obj

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)
        if new_status == Booking.STATUS_CANCELLED:
            user = self.request.user
            if not (user == instance.user or user.is_staff or user == instance.provider.user):
                raise PermissionDenied("Not allowed to cancel")
        serializer.save()
