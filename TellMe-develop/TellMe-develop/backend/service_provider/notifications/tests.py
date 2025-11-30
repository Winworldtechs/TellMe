from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import NotificationLog

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='notify@example.com', password='test123')
        self.client.force_authenticate(self.user)

    def test_my_notifications(self):
        NotificationLog.objects.create(
            user=self.user,
            title="Test Notification",
            message="You have a test.",
            type="general"
        )
        response = self.client.get('/api/notifications/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)