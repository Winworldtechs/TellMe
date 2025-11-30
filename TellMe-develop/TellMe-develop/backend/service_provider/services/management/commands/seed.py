from django.core.management.base import BaseCommand
from accounts.models import User
from services.models import ServiceCategory, ServiceProvider, Service, Machinery # <-- Machinery को import करें
from datetime import time


class Command(BaseCommand):
    help = 'Seed initial data (categories, sample users, and services)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Seeding initial data...'))

        # ✅ Create Service Categories
        categories = [
            {"slug": "salon", "title": "Salon", "description": "Salon services"},
            {"slug": "car_wash", "title": "Car Wash", "description": "Car cleaning services"},
            {"slug": "machinery", "title": "Machinery Rental", "description": "Heavy machinery for rent"},
        ]
        for cat in categories:
            ServiceCategory.objects.get_or_create(
                slug=cat['slug'],
                defaults={"title": cat['title'], "description": cat['description']}
            )
        self.stdout.write(self.style.SUCCESS('✅ Categories seeded'))

        # ✅ Create Normal User
        if not User.objects.filter(email='user@example.com').exists():
            user = User.objects.create_user(
                email='user@example.com',
                username='normaluser',
                password='test1234',
                city='Delhi',
                state='Delhi',
                pincode='110001'
            )
            self.stdout.write(self.style.SUCCESS('✅ Normal user created'))
        else:
            user = User.objects.get(email='user@example.com')
            self.stdout.write(self.style.WARNING('⚠️ Normal user already exists'))

        # ✅ Create Provider User
        if not User.objects.filter(email='provider@example.com').exists():
            provider_user = User.objects.create_user(
                email='provider@example.com',
                username='provideruser',
                password='test1234',
                is_provider=True,
                city='Delhi',
                state='Delhi',
                pincode='110002'
            )
            self.stdout.write(self.style.SUCCESS('✅ Provider user created'))
        else:
            provider_user = User.objects.get(email='provider@example.com')
            self.stdout.write(self.style.WARNING('⚠️ Provider user already exists'))

        # ✅ Create ServiceProvider
        category = ServiceCategory.objects.get(slug='salon')
        provider, created = ServiceProvider.objects.get_or_create(
            user=provider_user,
            defaults={
                'category': category,
                'name': 'Glam Salon',
                'address': '123 Main Street',
                'lat': 28.6139,
                'lng': 77.2090,
                'open_time': time(10, 0),
                'close_time': time(19, 0),
                'open_days': ['mon', 'tue', 'wed', 'thu', 'fri'],
                'charges': 100.00,
                'description': 'Top rated salon in Delhi',
                'is_verified': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✅ ServiceProvider created'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ ServiceProvider already exists'))

        # ✅ Create a Service
        service, created = Service.objects.get_or_create(
            provider=provider,
            title='Haircut',
            defaults={
                'description': 'Professional haircut service',
                'duration_minutes': 30,
                'price': 300.00,
                'slot_interval': 30,
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Service created'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Service already exists'))

        # ✅ Add Machinery data (This is the new section)
        if ServiceProvider.objects.first(): # Ensure at least one provider exists
            machinery_provider = ServiceProvider.objects.first()
            
            machinery_list = [
                {
                    "name": "JCB Excavator",
                    "description": "Heavy-duty hydraulic excavator ideal for digging.",
                    "rental_cost_per_hour": 1500.00,
                    "current_lat": 28.6139,
                    "current_lng": 77.2090,
                    "is_available": True,
                    "is_verified": True,
                },
                {
                    "name": "Concrete Mixer Truck",
                    "description": "Truck with a rotating drum to mix and transport concrete.",
                    "rental_cost_per_hour": 1200.00,
                    "current_lat": 19.0760,
                    "current_lng": 72.8777,
                    "is_available": True,
                    "is_verified": True,
                },
                {
                    "name": "Agricultural Tractor",
                    "description": "A versatile machine used for farming tasks.",
                    "rental_cost_per_hour": 500.00,
                    "current_lat": 23.0225,
                    "current_lng": 72.5714,
                    "is_available": True,
                    "is_verified": True,
                }
            ]
            
            # Create machinery objects in the database
            for data in machinery_list:
                Machinery.objects.get_or_create(
                    provider=machinery_provider, # Assign to the first available provider
                    name=data['name'],
                    defaults={
                        "description": data['description'],
                        "rental_cost_per_hour": data['rental_cost_per_hour'],
                        "current_lat": data['current_lat'],
                        "current_lng": data['current_lng'],
                        "is_available": data['is_available'],
                        "is_verified": data['is_verified'],
                    }
                )
            self.stdout.write(self.style.SUCCESS(f'✅ {len(machinery_list)} machinery items successfully added.'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ No service providers found, skipping machinery seeding.'))

        self.stdout.write(self.style.SUCCESS('🎉 Seeding complete!'))