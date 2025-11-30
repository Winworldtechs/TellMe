from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, UserSubscription
from django.contrib.auth import get_user_model

User = get_user_model()

class SubscriptionTests(APITestCase):

    def setUp(self):
        # Create admin test user
        self.user = User.objects.create_user(email='testuser@example.com', username='testuser', password='password123')
        self.user.is_staff = True  # Admin rights for accessing plans
        self.user.save()

        self.basic_plan = SubscriptionPlan.objects.create(
            name='basic',
            description='Basic plan',
            price=100.0,
            duration_days=30,
            features={"max_deals": 5}
        )
        self.premium_plan = SubscriptionPlan.objects.create(
            name='premium',
            description='Premium plan',
            price=200.0,
            duration_days=90,
            features={"max_deals": 20}
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_subscription_plans(self):
        url = reverse('plans-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 2)

    def test_create_user_subscription(self):
        url = reverse('user-subscription-list')
        data = {"plan_id": self.basic_plan.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        sub = UserSubscription.objects.get(user=self.user)
        self.assertEqual(sub.plan, self.basic_plan)
        self.assertTrue(sub.is_active)
        self.assertEqual(sub.end_date, timezone.now().date() + timedelta(days=self.basic_plan.duration_days))

    def test_prevent_multiple_active_subscriptions(self):
        UserSubscription.objects.create(
            user=self.user,
            plan=self.basic_plan,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timedelta(days=30),
            is_active=True
        )
        url = reverse('user-subscription-list')
        data = {"plan_id": self.premium_plan.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You already have an active subscription.', str(response.data))
