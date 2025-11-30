from rest_framework import serializers
from .models import CarPoolingVendor


class CarPoolingVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarPoolingVendor
        fields = "__all__"
