from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ServiceCategory,
    ServiceProvider,
    Service,
    Machinery,
    Booking,
    MachineryBooking,
    Offer,
    OfferBooking,GroceryVendor, GroceryItem,GroceryBooking,
)

User = get_user_model()

# ---------------------- SERVICE CATEGORY ----------------------
class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'slug', 'title', 'description']


# ---------------------- MACHINERY ----------------------
class MachinerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Machinery
        fields = [
            'id', 'provider', 'name', 'description', 
            'rental_cost_per_hour', 'current_lat', 'current_lng', 
            'is_available', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'provider', 'is_verified', 'created_at']


# ---------------------- SERVICE ----------------------
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'title', 'description', 
            'duration_minutes', 'price', 'slot_interval', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ---------------------- MOST BOOKED SERVICE ----------------------
class MostBookedServiceSerializer(serializers.ModelSerializer):
    total_bookings = serializers.IntegerField(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'title', 'description', 'price', 
            'total_bookings', 
            'logo_url'
        ]


# ---------------------- SERVICE PROVIDER ----------------------
class ServiceProviderSerializer(serializers.ModelSerializer):
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=ServiceCategory.objects.all(), source='category', write_only=True, required=False)
    services = ServiceSerializer(many=True, read_only=True)
    machinery = MachinerySerializer(many=True, read_only=True)

    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'user', 'category', 'category_id', 'name', 'logo','logo_url', 'address',
            'lat', 'lng', 'open_time', 'close_time', 'open_days','slot_interval',  'charges',
            'description', 'is_verified', 'services', 'machinery', 'created_at' 
        ]
        read_only_fields = ['id', 'is_verified', 'created_at']


# ---------------------- BOOKING ----------------------
class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'service', 'service_title', 'user', 
            'scheduled_time', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


# ---------------------- MACHINERY BOOKING ----------------------
class MachineryBookingSerializer(serializers.ModelSerializer):
    machinery_name = serializers.CharField(source='machinery.name', read_only=True)

    class Meta:
        model = MachineryBooking
        fields = [
            'id', 'machinery', 'machinery_name', 'user', 
            'start_time', 'end_time', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


# ---------------------- OFFER ----------------------
class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            'id',
            'provider',
            'title',
            'subtitle',
            'description',
            'image',
            'start_date',
            'end_date',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ---------------------- OFFER BOOKING ----------------------
class OfferBookingSerializer(serializers.ModelSerializer):
    offer_title = serializers.CharField(source='offer.title', read_only=True)

    class Meta:
        model = OfferBooking
        fields = [
            'id',
            'offer',
            'offer_title',
            'name',
            'email',
            'phone',
            'booking_date',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']

#//---------------------- SERVICE CARD (for listing) ----------------------//



class ServiceCardSerializer(serializers.ModelSerializer):
    provider_id = serializers.IntegerField(source='provider.id', read_only=True)   
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    provider_logo = serializers.CharField(source='provider.logo_url', read_only=True)
    address = serializers.CharField(source='provider.address', read_only=True)

    distance = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id',
            'title',
            'price',
            'provider_id',      
            'provider_name',
            'provider_logo',
            'address',
            'distance',
        ]

    def get_distance(self, obj):
        request = self.context.get('request')
        if not request:
            return None

        user_lat = request.query_params.get("lat")
        user_lng = request.query_params.get("lng")

        if not (user_lat and user_lng and obj.provider.lat and obj.provider.lng):
            return None

        try:
            from math import radians, cos, sin, asin, sqrt

            def haversine_km(lat1, lon1, lat2, lon2):
                lat1, lon1, lat2, lon2 = map(radians, map(float, [lat1, lon1, lat2, lon2]))
                dlon = lon2 - lon1
                dlat = lat2 - lat1
                a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
                return 6371 * 2 * asin(sqrt(a))

            d = haversine_km(
                float(user_lat),
                float(user_lng),
                float(obj.provider.lat),
                float(obj.provider.lng)
            )
            return round(d, 2)

        except:
            return None


# ---------------------- GROCERY VENDOR  ----------------------
class GroceryVendorSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GroceryVendor
        fields = [
            "id",
            "name",
            "slug",
            "categories",
            "rating",
            "distance",
            "image_url",
            "provider"
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ""
# ---------------------- GROCERY ITEM SERIALIZER ----------------------
class GroceryItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GroceryItem
        fields = [
            "id",
            "name",
            "type",
            "price_per_kg",
            "image_url",
            "vendor"
        ]

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return ""
    
# ---------------------- GROCERY BOOKING SERIALIZER ----------------------
class GroceryBookingSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = GroceryBooking
        fields = [
            "id",
            "user",
            "vendor",
            "vendor_name",
            "items",
            "total_qty",
            "total_price",
            "status",
            "created_at"
        ]
        read_only_fields = ["id", "created_at", "status"]

