from rest_framework import serializers
from .models import MostBooked

class MostBookedSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = MostBooked
        fields = ['id', 'title', 'image']