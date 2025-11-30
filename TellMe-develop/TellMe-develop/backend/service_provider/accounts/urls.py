from django.urls import path
from .views import RegisterView, LoginView, ProfileView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, reverse_geocode


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("reverse-geocode/", reverse_geocode, name="reverse-geocode"),
]
