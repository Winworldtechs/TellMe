# towing/views.py

from rest_framework import generics, permissions
from .models import TowingProvider
from .serializers import TowingProviderSerializer

class TowingProviderListCreateView(generics.ListCreateAPIView):
    queryset = TowingProvider.objects.all()
    serializer_class = TowingProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TowingProviderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TowingProvider.objects.all()
    serializer_class = TowingProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]