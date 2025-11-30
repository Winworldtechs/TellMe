# location/serializers.py
from rest_framework import serializers

class PlaceSearchSerializer(serializers.Serializer):
    query = serializers.CharField()

class ReverseGeocodeSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()