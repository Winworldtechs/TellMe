from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

class AccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_user(self):
        response = self.client.post('/api/accounts/register/', {
            "email": "test@example.com",
            "password": "test12345"
        })
        self.assertEqual(response.status_code, 201)