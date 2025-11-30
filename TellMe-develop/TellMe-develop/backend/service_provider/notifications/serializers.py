from rest_framework import serializers
from .models import NotificationLog

class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = '__all__'
        read_only_fields = ['id', 'status', 'provider_response', 'created_at', 'sent_at']