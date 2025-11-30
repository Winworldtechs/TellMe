from rest_framework import generics
from .models import MostBooked
from .serializers import MostBookedSerializer


# ✅ GET list: सभी most booked items (Bike wash, Sofa cleaning आदि)
class MostBookedListAPIView(generics.ListAPIView):
    queryset = MostBooked.objects.all().order_by('id')
    serializer_class = MostBookedSerializer


# ✅ GET detail: एक single item (ID से)
class MostBookedDetailAPIView(generics.RetrieveAPIView):
    queryset = MostBooked.objects.all()
    serializer_class = MostBookedSerializer