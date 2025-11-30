from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import CarPoolingVendor
from .serializers import CarPoolingVendorSerializer


class CarPoolingVendorListCreateView(ListCreateAPIView):
    queryset = CarPoolingVendor.objects.all()
    serializer_class = CarPoolingVendorSerializer


class CarPoolingVendorDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CarPoolingVendor.objects.all()
    serializer_class = CarPoolingVendorSerializer
