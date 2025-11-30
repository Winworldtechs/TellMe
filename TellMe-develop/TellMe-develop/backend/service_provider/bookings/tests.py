from django.test import TestCase
from django.contrib.auth import get_user_model
from services.models import ServiceCategory, ServiceProvider, Service
from .models import Booking
from datetime import date, time, timedelta, datetime
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()

class BookingSlotTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='user@example.com', password='pass1234')
        self.provider_user = User.objects.create_user(email='prov@example.com', password='pass1234', is_provider=True)
        self.category = ServiceCategory.objects.create(slug='salon', title='Salon')
        self.provider = ServiceProvider.objects.create(
            user=self.provider_user,
            category=self.category,
            name='Test Salon',
            open_time=time(9,0),
            close_time=time(18,0),
            open_days=['mon','tue','wed','thu','fri','sat']
        )
        self.service = Service.objects.create(provider=self.provider, title='Haircut', duration_minutes=30, price=200.0, slot_interval=30)
        self.client = APIClient()

    def test_generate_slots_no_bookings(self):
        target_date = date.today()
        url = reverse('available-slots')
        resp = self.client.get(url, {'provider_id': self.provider.id, 'service_id': self.service.id, 'date': target_date.strftime("%Y-%m-%d")})
        self.assertEqual(resp.status_code, 200)
        slots = resp.data.get('slots')
        # provider open 9:00-18:00 -> slots from 9:00 to 17:30 inclusive (30min duration) => 18 slots
        self.assertTrue(len(slots) > 0)
        # check first slot label format
        self.assertIn(' - ', slots[0]['label'])

    def test_booking_creation_and_overlap(self):
        # authenticate user
        self.client.login(email='user@example.com', password='pass1234')  # Django test client login (session auth)
        self.client.force_authenticate(user=self.user)

        target_date = date.today()
        start_time = time(10,0)
        end_time = (datetime.combine(target_date, start_time) + timedelta(minutes=30)).time()

        create_url = reverse('booking-list-create')
        payload = {
            'service': self.service.id,
            'provider': self.provider.id,
            'date': target_date.strftime("%Y-%m-%d"),
            'start_time': start_time.strftime("%H:%M:%S"),
            'end_time': end_time.strftime("%H:%M:%S"),
            'notes': 'Please be on time'
        }
        resp = self.client.post(create_url, payload, format='json')
        self.assertEqual(resp.status_code, 201)
        # attempt overlapping booking
        resp2 = self.client.post(create_url, payload, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('overlaps', str(resp2.data).lower())