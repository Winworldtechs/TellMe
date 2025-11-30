from rest_framework import serializers
from .models import Booking
from services.models import Service, ServiceProvider
from datetime import datetime


# =====================================================================
# ✅ NORMAL SERIALIZER (For: GET /bookings/ , GET /bookings/<id>/)
# =====================================================================
class BookingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    provider = serializers.PrimaryKeyRelatedField(read_only=True)
    service = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'service',
            'provider',
            'date',
            'start_time',
            'end_time',
            'status',
            'price',
            'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
        

# =====================================================================
# ✅ CREATE SERIALIZER (Used When Creating Booking)
# =====================================================================
class BookingCreateSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'service',
            'date',
            'start_time',
            'end_time',
            'notes',
        ]
        read_only_fields = ['id', 'user']


    # -------------------------------------------------------------
    # 🔍 VALIDATION (slot duration + overlapping slot check)
    # -------------------------------------------------------------
    def validate(self, attrs):
        service = attrs.get('service')
        date = attrs.get('date')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if not service:
            raise serializers.ValidationError("Service must be provided.")

        provider = service.provider

        # ⏳ Check duration
        dt_start = datetime.combine(date, start_time)
        dt_end = datetime.combine(date, end_time)
        duration = (dt_end - dt_start).total_seconds() / 60.0

        expected_duration = service.duration_minutes

        if int(duration) != int(expected_duration):
            raise serializers.ValidationError(
                f"Slot duration incorrect. Expected {expected_duration} minutes."
            )

        # 🚫 Overlapping check
        existing = Booking.objects.filter(
            provider=provider,
            date=date
        ).exclude(status=Booking.STATUS_CANCELLED)

        for b in existing:
            if b.overlaps(start_time, end_time):
                raise serializers.ValidationError("This slot is already booked.")

        attrs['provider'] = provider
        return attrs


    # -------------------------------------------------------------
    # 🔧 CREATE – Auto-fill (user, price, provider)
    # -------------------------------------------------------------
    def create(self, validated_data):
        service = validated_data['service']
        validated_data['user'] = self.context['request'].user
        validated_data['provider'] = service.provider
        validated_data['price'] = service.price

        return Booking.objects.create(**validated_data)
