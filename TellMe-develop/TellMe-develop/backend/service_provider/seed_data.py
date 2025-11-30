import os
import django
from datetime import time

# Environment setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'service_provider.settings')
django.setup()

from accounts.models import User
from services.models import ServiceProvider, ServiceCategory

def create_seed_data():
    print("Creating categories...")
    category1, _ = ServiceCategory.objects.get_or_create(
        title='Plumbing',
        slug='plumbing',
        defaults={'description': 'Plumbing related services'}
    )

    category2, _ = ServiceCategory.objects.get_or_create(
        title='Electrician',
        slug='electrician',
        defaults={'description': 'Electrical services'}
    )
    print("Categories created.")

    print("Creating dummy user...")
    user_email = 'testuser@example.com'
    if not User.objects.filter(email=user_email).exists():
        user = User.objects.create_user(
            email=user_email,
            password='password123',
            first_name='Test',
            last_name='User',
            phone='1234567890',
            is_provider=True
        )
        print("Dummy user created.")
    else:
        user = User.objects.get(email=user_email)
        print("Dummy user already exists.")

    print("Creating dummy service provider...")
    ServiceProvider.objects.get_or_create(
        user=user,
        name="Reliable Plumbers",
        description="We fix all your plumbing needs.",
        category=category1,
        open_time=time(9, 0),   # ✅ Required field
        close_time=time(18, 0)  # ✅ Required field
    )
    print("Service provider created.")

if __name__ == '__main__':
    create_seed_data()
