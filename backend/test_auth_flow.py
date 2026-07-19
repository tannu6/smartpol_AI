import os
import sys
import django
import json
import uuid
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartpol.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')
settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

from django.test import Client
from django.contrib.auth import get_user_model
from django.core import mail
from api.models import OTPRecord, PasswordResetToken

User = get_user_model()
client = Client()

print("--- Starting Auth Flow Tests ---")

# 1. Registration
print("\\n1. Testing Registration")
username = f"testuser_{uuid.uuid4().hex[:6]}"
email = f"{username}@example.com"
password = "StrongPassword123!"

register_data = {
    "username": username,
    "email": email,
    "password": password,
    "password_confirm": password,
    "first_name": "Test",
    "last_name": "User",
    "role": User.ROLE_CITIZEN
}

response = client.post('/api/v1/auth/register/', data=json.dumps(register_data), content_type='application/json')
assert response.status_code == 201
user_id = response.json()['user_id']
assert len(mail.outbox) == 1

email_body = mail.outbox[0].body
print("Email plain text body:")
print(repr(email_body))

match = re.search(r'(\d{6})', email_body)
if not match:
    # Try HTML body if available
    if hasattr(mail.outbox[0], 'alternatives'):
        html_body = mail.outbox[0].alternatives[0][0]
        match = re.search(r'(\d{6})', html_body)

if match:
    otp_code = match.group(1)
else:
    raise Exception("Could not find OTP in email")

print(f"Extracted OTP: {otp_code}")

# 2. Verify OTP
verify_data = {
    "user_id": user_id,
    "otp_code": otp_code
}
response = client.post('/api/v1/auth/verify-otp/', data=json.dumps(verify_data), content_type='application/json')
assert response.status_code == 200

# 3. Login
login_data = {
    "username": username,
    "password": password
}
response = client.post('/api/v1/auth/login/', data=json.dumps(login_data), content_type='application/json')
assert response.status_code == 200

# 4. Forgot Password
forgot_data = {
    "email": email
}
mail.outbox = []
response = client.post('/api/v1/auth/forgot-password/', data=json.dumps(forgot_data), content_type='application/json')
assert response.status_code == 200
assert len(mail.outbox) == 1

user = User.objects.get(id=user_id)
reset_token_obj = PasswordResetToken.objects.filter(user=user).last()
reset_token = reset_token_obj.token

# 5. Reset Password
new_password = "NewStrongPassword123!"
reset_data = {
    "token": reset_token,
    "password": new_password,
    "password_confirm": new_password
}
response = client.post('/api/v1/auth/reset-password/', data=json.dumps(reset_data), content_type='application/json')
assert response.status_code == 200

# 6. Login with New Password
login_data_new = {
    "username": username,
    "password": new_password
}
response = client.post('/api/v1/auth/login/', data=json.dumps(login_data_new), content_type='application/json')
assert response.status_code == 200

print("\\n--- All Auth Flow Tests Passed! ---")
