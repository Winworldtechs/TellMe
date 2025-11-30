from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Deal, InterestedDeal
from .serializers import (
    DealListSerializer,
    DealCreateUpdateSerializer,
    InterestedDealSerializer,
)


class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated:
            return Deal.objects.filter(
                Q(is_active=True) | Q(seller=user)
            ).distinct()

        return Deal.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DealCreateUpdateSerializer
        return DealListSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    # ⭐ NEW: Mark a deal as interested
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def interested(self, request, pk=None):
        deal = self.get_object()

        interest, created = InterestedDeal.objects.get_or_create(
            user=request.user,
            deal=deal
        )

        if created:
            return Response({"message": "Marked as interested"})
        else:
            return Response({"message": "Already marked as interested"})
