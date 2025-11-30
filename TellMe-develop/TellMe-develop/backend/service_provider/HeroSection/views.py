# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from .models import Hero
from .serializers import HeroSerializer

# 🔹 Public API — केवल GET की अनुमति
@api_view(['GET'])
@permission_classes([AllowAny])
def get_hero(request):
    hero = Hero.objects.last()  # latest hero data
    serializer = HeroSerializer(hero, context={'request': request})
    return Response(serializer.data)


# 🔹 Admin-only API — केवल admin बदल सके
@api_view(['POST', 'PUT'])
@permission_classes([IsAdminUser])
def update_hero(request):
    hero = Hero.objects.last()
    serializer = HeroSerializer(hero, data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Hero section updated successfully!"})
    return Response(serializer.errors, status=400)