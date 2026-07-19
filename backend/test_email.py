"""Quick test to see if Django can send email via the configured SMTP."""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartpol.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.conf import settings

print("=" * 50)
print("EMAIL CONFIGURATION CHECK")
print("=" * 50)
print(f"BACKEND:    {settings.EMAIL_BACKEND}")
print(f"HOST:       {settings.EMAIL_HOST}")
print(f"PORT:       {settings.EMAIL_PORT}")
print(f"USE_TLS:    {settings.EMAIL_USE_TLS}")
print(f"USE_SSL:    {settings.EMAIL_USE_SSL}")
print(f"HOST_USER:  {settings.EMAIL_HOST_USER}")
print(f"PASSWORD:   {'*' * len(settings.EMAIL_HOST_PASSWORD)} ({len(settings.EMAIL_HOST_PASSWORD)} chars)")
print(f"FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print("=" * 50)

from django.core.mail import send_mail

try:
    result = send_mail(
        subject='SmartPol AI - SMTP Test',
        message='If you receive this, your SMTP config is working!',
        from_email=settings.EMAIL_HOST_USER,  # Use actual Gmail address
        recipient_list=[settings.EMAIL_HOST_USER],  # Send to self
        fail_silently=False,  # DONT swallow errors
    )
    print(f"\n✅ Email sent successfully! send_mail returned: {result}")
except Exception as e:
    print(f"\n❌ Email FAILED: {type(e).__name__}: {e}")
