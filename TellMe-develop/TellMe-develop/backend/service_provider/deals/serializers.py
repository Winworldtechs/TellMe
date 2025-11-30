from rest_framework import serializers
from .models import Deal, InterestedDeal


class DealListSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Deal
        exclude = ['seller']
        read_only_fields = ['created_at', 'updated_at', 'paid_until']


class DealCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = [
            'category', 'title', 'description',
            'image', 'rate', 'location',
            'phone', 'email', 'is_active', 'paid_until'
        ]


# ⭐ NEW: Serializer for interest save
class InterestedDealSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterestedDeal
        fields = ['id', 'deal', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']
