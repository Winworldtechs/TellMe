# towing/serializers.py

from rest_framework import serializers
from .models import TowingProvider

class TowingProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = TowingProvider
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']