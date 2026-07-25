import os
import sys
import django
import json
import uuid
import re
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartpol.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')
settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

from django.test import Client
from django.contrib.auth import get_user_model
from django.core import mail
from api.models import OTPRecord, PasswordResetToken
from django.utils import timezone

User = get_user_model()
client = Client()

print("--- Starting Comprehensive Auth Flow Tests ---")

# 1. New Registration
print("\\n1. Testing New Registration")
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
assert response.status_code == 201, f"Registration failed: {response.json()}"
user_id = response.json()['user_id']
assert len(mail.outbox) == 1

def extract_otp(email_msg):
    email_body = email_msg.body
    match = re.search(r'(\\d{6})', email_body)
    if not match and hasattr(email_msg, 'alternatives'):
        match = re.search(r'(\\d{6})', email_msg.alternatives[0][0])
    return match.group(1) if match else None

otp_code = extract_otp(mail.outbox[-1])
print(f"Extracted OTP: {otp_code}")

# 2. Wrong OTP
print("\\n2. Testing Wrong OTP")
wrong_verify_data = {
    "user_id": user_id,
    "otp_code": "000000"
}
response = client.post('/api/v1/auth/verify-otp/', data=json.dumps(wrong_verify_data), content_type='application/json')
assert response.status_code == 400
print("Wrong OTP correctly rejected.")

# 3. Expired OTP
print("\\n3. Testing Expired OTP")
otp_record = OTPRecord.objects.filter(user_id=user_id, is_used=False).last()
otp_record.expires_at = timezone.now() - timedelta(minutes=1)
otp_record.save()

verify_data = {
    "user_id": user_id,
    "otp_code": otp_code
}
response = client.post('/api/v1/auth/verify-otp/', data=json.dumps(verify_data), content_type='application/json')
assert response.status_code == 400
print("Expired OTP correctly rejected.")

# 4. Resend OTP
print("\\n4. Testing Resend OTP")
mail.outbox = []
resend_data = {
    "user_id": user_id
}
response = client.post('/api/v1/auth/resend-otp/', data=json.dumps(resend_data), content_type='application/json')
assert response.status_code == 200, f"Resend failed: {response.json()}"
assert len(mail.outbox) == 1
new_otp_code = extract_otp(mail.outbox[-1])
print(f"New OTP extracted: {new_otp_code}")

# 5. OTP verification
print("\\n5. Testing OTP verification")
verify_data_new = {
    "user_id": user_id,
    "otp_code": new_otp_code
}
response = client.post('/api/v1/auth/verify-otp/', data=json.dumps(verify_data_new), content_type='application/json')
assert response.status_code == 200
print("OTP verified successfully.")

# 6. Wrong password
print("\\n6. Testing Wrong Password Login")
wrong_login_data = {
    "username": username,
    "password": "WrongPassword123!"
}
response = client.post('/api/v1/auth/login/', data=json.dumps(wrong_login_data), content_type='application/json')
assert response.status_code == 401
print("Wrong password correctly rejected.")

# 7. Login
print("\\n7. Testing Correct Login")
login_data = {
    "username": username,
    "password": password
}
response = client.post('/api/v1/auth/login/', data=json.dumps(login_data), content_type='application/json')
assert response.status_code == 200
print("Login successful.")

# 8. Forgot Password
print("\\n8. Testing Forgot Password")
forgot_data = {
    "email": email
}
mail.outbox = []
response = client.post('/api/v1/auth/forgot-password/', data=json.dumps(forgot_data), content_type='application/json')
assert response.status_code == 200
assert len(mail.outbox) == 1
user = User.objects.get(id=user_id)
reset_token = PasswordResetToken.objects.filter(user=user).last().token
print("Forgot password email sent.")

# 9. Password reset
print("\\n9. Testing Password Reset")
new_password = "NewStrongPassword123!"
reset_data = {
    "token": reset_token,
    "password": new_password,
    "password_confirm": new_password
}
response = client.post('/api/v1/auth/reset-password/', data=json.dumps(reset_data), content_type='application/json')
assert response.status_code == 200
print("Password reset successful.")

# 10. Login with new password
print("\\n10. Testing Login with New Password")
login_data_new = {
    "username": username,
    "password": new_password
}
response = client.post('/api/v1/auth/login/', data=json.dumps(login_data_new), content_type='application/json')
assert response.status_code == 200
print("Login with new password successful.")

print("\\n--- All Edge Case Tests Passed! ---")
