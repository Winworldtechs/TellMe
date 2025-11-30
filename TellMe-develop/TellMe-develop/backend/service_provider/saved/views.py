from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SavedService
from services.models import Service


# ✅ Toggle save / unsave
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_save(request):
    user = request.user
    service_id = request.data.get("service")

    try:
        service = Service.objects.get(id=service_id)
    except:
        return Response({"error": "Service not found"}, status=404)

    exist = SavedService.objects.filter(user=user, service=service)

    if exist.exists():
        exist.delete()
        return Response({"saved": False})
    else:
        SavedService.objects.create(user=user, service=service)
        return Response({"saved": True})


# ✅ Check if saved
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_saved(request, service_id):
    user = request.user
    saved = SavedService.objects.filter(user=user, service_id=service_id).exists()
    return Response({"saved": saved})


# ✅ Saved list for profile
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_list(request):
    saved_items = (
        SavedService.objects.filter(user=request.user)
        .select_related("service")
        .order_by("-created_at")
    )

    data = []
    for item in saved_items:
        s = item.service
        data.append({
            "service_id": s.id,
            "name": s.name,
            "image": s.image.url if s.image else None,
            "company": getattr(s, "company", None),
            "rating": getattr(s, "rating", None),
            "distance": getattr(s, "distance", None),
        })

    return Response(data)
