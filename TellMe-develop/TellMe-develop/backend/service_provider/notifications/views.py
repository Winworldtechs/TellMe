from rest_framework import viewsets, permissions
from .models import NotificationLog
from .serializers import NotificationLogSerializer
from .tasks import send_notification_task

class NotificationLogViewSet(viewsets.ModelViewSet):
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin can see all logs
        if user.is_staff:
            return NotificationLog.objects.all().order_by("-sent_at")

        # Normal user → only their own logs
        return NotificationLog.objects.filter(user=user).order_by("-sent_at")

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        send_notification_task.delay(str(instance.id))
