import re

from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from .models import Complaint, ComplaintTimeline, Evidence, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AuthenticationAndCaseApiTests(APITestCase):
    password = 'S3cure-passphrase!2026'

    def register_and_verify(self, username='citizen', email='citizen@example.com'):
        response = self.client.post('/api/v1/auth/register/', {
            'username': username,
            'email': email,
            'password': self.password,
            'password_confirm': self.password,
            'role': 'admin',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username=username)
        self.assertEqual(user.role, User.ROLE_CITIZEN)
        otp = re.search(r'(\d{6})', mail.outbox[-1].body).group(1)
        verified = self.client.post('/api/v1/auth/verify-otp/', {'user_id': user.id, 'otp_code': otp}, format='json')
        self.assertEqual(verified.status_code, 200, verified.data)
        return user, verified.data['tokens']

    def authenticate(self, tokens):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

    def test_registration_verification_login_profile_and_logout(self):
        user, tokens = self.register_and_verify()
        login = self.client.post('/api/v1/auth/login/', {'username': user.username, 'password': self.password}, format='json')
        self.assertEqual(login.status_code, 200, login.data)
        self.authenticate(tokens)
        self.assertEqual(self.client.get('/api/v1/auth/me/').status_code, 200)
        profile = self.client.patch('/api/v1/auth/me/', {'phone': '9876543210', 'role': 'admin'}, format='json')
        self.assertEqual(profile.status_code, 200, profile.data)
        user.refresh_from_db()
        self.assertEqual(user.phone, '9876543210')
        self.assertEqual(user.role, User.ROLE_CITIZEN)
        logout = self.client.post('/api/v1/auth/logout/', {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(logout.status_code, 204, logout.data)

    def test_complaint_status_timeline_and_evidence_permissions(self):
        citizen, tokens = self.register_and_verify()
        self.authenticate(tokens)
        invalid = self.client.post('/api/v1/complaints/', {'title': 'Bad', 'description': 'short', 'category': 'fraud'}, format='json')
        self.assertEqual(invalid.status_code, 400)
        created = self.client.post('/api/v1/complaints/', {
            'title': 'Fraudulent UPI transfer',
            'description': 'I received a fraud refund call and transferred money using my UPI account.',
            'category': 'Financial Fraud',
            'location': 'Ahmedabad',
        }, format='json')
        self.assertEqual(created.status_code, 201, created.data)
        complaint = Complaint.objects.get(pk=created.data['id'])
        self.assertTrue(ComplaintTimeline.objects.filter(complaint=complaint, event='Complaint Filed').exists())
        self.assertEqual(self.client.patch(f'/api/v1/complaints/{complaint.id}/status/', {'status': 'investigating'}, format='json').status_code, 403)

        officer = User.objects.create_user(username='officer', email='officer@example.com', password=self.password, role=User.ROLE_OFFICER)
        complaint.assigned_officer = officer
        complaint.save(update_fields=['assigned_officer'])
        self.client.force_authenticate(user=officer)
        status_update = self.client.patch(f'/api/v1/complaints/{complaint.id}/status/', {'status': 'investigating', 'note': 'Case accepted.'}, format='json')
        self.assertEqual(status_update.status_code, 200, status_update.data)
        self.assertTrue(ComplaintTimeline.objects.filter(complaint=complaint, description='Case accepted.').exists())

        self.client.force_authenticate(user=citizen)
        rejected = self.client.post('/api/v1/upload/', {'complaint_id': complaint.id, 'file': SimpleUploadedFile('malware.exe', b'bad', content_type='application/octet-stream')}, format='multipart')
        self.assertEqual(rejected.status_code, 400)
        uploaded = self.client.post('/api/v1/upload/', {'complaint_id': complaint.id, 'file': SimpleUploadedFile('statement.txt', b'payment reference 123', content_type='text/plain')}, format='multipart')
        self.assertEqual(uploaded.status_code, 201, uploaded.data)
        self.assertEqual(Evidence.objects.get(pk=uploaded.data['id']).hash_value.__len__(), 64)

    def test_password_reset_persists_and_replaces_password(self):
        user, _ = self.register_and_verify('reset-user', 'reset@example.com')
        mail.outbox.clear()
        response = self.client.post('/api/v1/auth/forgot-password/', {'email': user.email}, format='json')
        self.assertEqual(response.status_code, 200)
        token = re.search(r'token=([^\s]+)', mail.outbox[-1].body).group(1)
        new_password = 'Different-passphrase!2026'
        reset = self.client.post('/api/v1/auth/reset-password/', {'token': token, 'password': new_password, 'password_confirm': new_password}, format='json')
        self.assertEqual(reset.status_code, 200, reset.data)
        self.assertEqual(self.client.post('/api/v1/auth/login/', {'username': user.username, 'password': new_password}, format='json').status_code, 200)
