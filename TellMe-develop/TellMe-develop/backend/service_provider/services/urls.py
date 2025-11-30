from .views import (
    CategoryListCreateView, CategoryDetailView, 
    ProviderListView, ProviderCreateView, ProviderDetailView,
    ServiceDetailView, ServiceListView, ServiceCreateView, ProvidersByServiceSlugView,
    MachineryViewSet,
    MostBookedServicesView,
    OfferListCreateView, OfferDetailView,
    OfferBookingListCreateView, OfferBookingDetailView, AvailableSlotsAPIView,GroceryVendorListView, GroceryVendorItemsView,
    GroceryBookingView,
)

from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'machinery', MachineryViewSet, basename='machinery')

urlpatterns = [
    # ---------------- CATEGORIES ----------------
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),

    # ---------------- PROVIDERS ----------------
    path('providers/', ProviderListView.as_view(), name='provider-list'),
    path('providers/create/', ProviderCreateView.as_view(), name='provider-create'),
    path('providers/<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),

    # ✅ NEW (Optional): Provider Slot Config Endpoint
    # ये सिर्फ readability और clarity के लिए रखा गया है — same ProviderDetailView को use करता है।
    path('providers/<int:pk>/slots/', ProviderDetailView.as_view(), name='provider-slot-update'),

    # ---------------- PROVIDERS BY SERVICE SLUG ----------------
    path('providers/by-service/', ProvidersByServiceSlugView.as_view(), name='providers-by-service'),

    # ---------------- SERVICES ----------------
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/create/', ServiceCreateView.as_view(), name='service-create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),

    # ---------------- MOST BOOKED SERVICES ----------------
    path('most-booked/', MostBookedServicesView.as_view(), name='most-booked-services'), 

    # ---------------- OFFERS ----------------
    path('offers/', OfferListCreateView.as_view(), name='offer-list-create'),
    path('offers/<int:pk>/', OfferDetailView.as_view(), name='offer-detail'),

    # ---------------- OFFER BOOKINGS ----------------
    path('offer-bookings/', OfferBookingListCreateView.as_view(), name='offer-booking-list-create'),
    path('offer-bookings/<int:pk>/', OfferBookingDetailView.as_view(), name='offer-booking-detail'),

    path('bookings/slots/', AvailableSlotsAPIView.as_view(), name='available-slots'),

    # ---------------- GROCERY VENDORS ----------------
    
    path("grocery/vendors/", GroceryVendorListView.as_view(), name="grocery-vendors"),
    path("grocery/vendors/<slug:slug>/items/", GroceryVendorItemsView.as_view(), name="grocery-items"),
    path("grocery/book/", GroceryBookingView.as_view()),




    # ---------------- ROUTER ----------------
    path('', include(router.urls)),
]
