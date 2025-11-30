from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubscriptionPlanViewSet, UserSubscriptionViewSet, NotificationLogViewSet

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='plans')
router.register(r'user-subscriptions', UserSubscriptionViewSet, basename='user-subscriptions')
router.register(r'notifications', NotificationLogViewSet, basename='subscription-notifications')

urlpatterns = [
    path('', include(router.urls)),
    
]