from rest_framework import serializers
from .models import Hero

class HeroSerializer(serializers.ModelSerializer):
    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()
    image4_url = serializers.SerializerMethodField()

    class Meta:
        model = Hero
        fields = [
            'id', 'title', 'subtitle',
            'image1_url', 'image2_url', 'image3_url', 'image4_url',
            'button_text', 'updated_at'
        ]

    def get_image1_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image1.url) if obj.image1 else None

    def get_image2_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image2.url) if obj.image2 else None

    def get_image3_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image3.url) if obj.image3 else None

    def get_image4_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image4.url) if obj.image4 else None
