from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .models import Advertisement
from .serializers import AdvertisementSerializer

class AdvertisementListCreateView(generics.ListCreateAPIView):
    queryset = Advertisement.objects.all().order_by('-created_at')
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.AllowAny]