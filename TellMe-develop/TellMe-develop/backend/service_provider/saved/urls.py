from django.urls import path
from .views import toggle_save, check_saved, saved_list

urlpatterns = [
    path("save-service/", toggle_save),
    path("save-service/<int:service_id>/", check_saved),
    path("profile/saved-services/", saved_list),
]
