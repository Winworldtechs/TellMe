from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


# Home route
def home(request):
    return HttpResponse("Welcome to the Home Page  TELLME APPLICATION!")


schema_view = get_schema_view(
   openapi.Info(
      title="Service Provider API",
      default_version='v1',
      description="API documentation for Service Provider app",
      contact=openapi.Contact(email="your-email@example.com"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    # AUTH
    path('api/accounts/', include('accounts.urls')),

    # SERVICES
    path('api/services/', include('services.urls')),

    # BOOKINGS
    path('api/bookings/', include('bookings.urls')),



    

    # CATEGORIES
    path('api/categories/', include('categories.urls')),

    # OTHERS
    path('api/deals/', include('deals.urls')),
    path('api/sos/', include('sos.urls')),
    path('api/towing/', include('towing.urls')),
    path('api/barcodes/', include('barcodes.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/hero/', include('HeroSection.urls')),
    path('api/offers/', include('deals.urls')),
    path('api/ads/', include('ads.urls')),
    
    # ✅ ✅ ✅ ADDED BACK
    path('api/', include('mostbooked.urls')),

    path('api/saved/', include('saved.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
