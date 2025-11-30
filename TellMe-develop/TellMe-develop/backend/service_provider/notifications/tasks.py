from celery import shared_task
from django.utils import timezone
from .models import NotificationLog
from django.core.mail import send_mail
import json
import os

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_notification_task(self, notif_id):
    try:
        notif = NotificationLog.objects.get(id=notif_id)
    except NotificationLog.DoesNotExist:
        return {"error": "not found"}

    provider_resp = {}
    try:
        if notif.notif_type == 'email':
            # Basic email (uses Django email settings)
            # payload may contain 'subject' and 'to' or use notif.user.email
            subject = notif.title or 'Notification'
            to = notif.payload.get('to') or (notif.user.email if notif.user else None)
            message = notif.message
            if not to:
                raise ValueError("No recipient email")
            send_mail(subject, message, os.getenv('EMAIL_FROM', None), [to], fail_silently=False)
            notif.status = 'sent'
            provider_resp = {"method": "django-send_mail", "to": to}
        elif notif.notif_type == 'sms':
            # Placeholder: integrate Twilio or other SMS provider
            phone = notif.payload.get('phone') or (notif.user.phone if hasattr(notif.user, 'phone') else None)
            if not phone:
                raise ValueError("No phone number")
            # send_sms(phone, notif.message)  # implement this
            notif.status = 'sent'
            provider_resp = {"method": "twilio-placeholder", "to": phone}
        elif notif.notif_type == 'push':
            # Placeholder: integrate FCM/OneSignal
            device_token = notif.payload.get('device_token')
            if not device_token and notif.user:
                # optionally fetch saved device tokens for user
                device_token = None
            if not device_token:
                raise ValueError("No device token")
            # send_push(device_token, notif.title, notif.message, notif.payload)
            notif.status = 'sent'
            provider_resp = {"method": "fcm-placeholder", "to": device_token}
        else:
            notif.status = 'failed'
            provider_resp = {"error": "unsupported type"}

    except Exception as exc:
        # mark failed and retry
        notif.status = 'failed'
        provider_resp = {"error": str(exc)}
        notif.provider_response = provider_resp
        notif.save()
        raise self.retry(exc=exc)

    notif.provider_response = provider_resp
    notif.sent_at = timezone.now()
    notif.save()
    return {"status": "ok", "id": str(notif.id)}