# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('hero/', views.get_hero, name='get-hero'),
    path('hero/update/', views.update_hero, name='update-hero'),
]