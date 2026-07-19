from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CITIZEN = 'citizen'
    ROLE_OFFICER = 'officer'
    ROLE_SUPERVISOR = 'supervisor'
    ROLE_SECRET_AGENT = 'secret_agent'
    ROLE_ADMIN = 'admin'

    ROLE_CHOICES = [
        (ROLE_CITIZEN, 'Citizen'),
        (ROLE_OFFICER, 'Officer'),
        (ROLE_SUPERVISOR, 'Supervisor'),
        (ROLE_SECRET_AGENT, 'Secret Agent'),
        (ROLE_ADMIN, 'System Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CITIZEN)
    badge_id = models.CharField(max_length=50, blank=True)
    district = models.CharField(max_length=100, default='Sector 7G')
    avatar_url = models.URLField(blank=True)
    duress_code = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=True)


class Complaint(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_INVESTIGATING = 'investigating'
    STATUS_RESOLVED = 'resolved'
    STATUS_ESCALATED = 'escalated'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_INVESTIGATING, 'Investigating'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_ESCALATED, 'Escalated'),
    ]

    complaint_id = models.CharField(max_length=20, unique=True)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General')
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    urgency_score = models.FloatField(default=0.0)
    readiness_score = models.FloatField(default=0.0)
    fraud_classification = models.CharField(max_length=100, blank=True)
    entities_extracted = models.JSONField(default=dict, blank=True)
    qr_code = models.CharField(max_length=100, blank=True)
    voice_note_url = models.URLField(blank=True)
    assigned_officer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-urgency_score', '-created_at']


class ComplaintTimeline(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='timeline')
    event = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class Evidence(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='evidence')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='evidence/', blank=True, null=True)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, default='document')
    hash_value = models.CharField(max_length=128, blank=True)
    chain_of_custody = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    encrypted = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    is_duress = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class AnonymousTip(models.Model):
    tracking_id = models.CharField(max_length=50, unique=True)
    body = models.TextField()  # Will store encrypted text
    status = models.CharField(max_length=20, default='restricted')
    category = models.CharField(max_length=50, default='general')
    risk_level = models.CharField(max_length=20, default='unknown')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, default='info')
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class Identifier(models.Model):
    identifier_type = models.CharField(max_length=50)
    value = models.CharField(max_length=255)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='identifiers', null=True, blank=True)
    risk_score = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class MuleAlert(models.Model):
    account_id = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100, blank=True)
    risk_level = models.CharField(max_length=20, default='high')
    transaction_count = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    linked_complaints = models.ManyToManyField(Complaint, blank=True)
    status = models.CharField(max_length=20, default='active')
    ai_analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-risk_level', '-created_at']


class ScamDNA(models.Model):
    pattern_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    dna_sequence = models.JSONField(default=list)
    confidence = models.FloatField(default=0.0)
    linked_cases = models.IntegerField(default=0)
    category = models.CharField(max_length=100, default='phishing')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-confidence']


class OfficerAssignment(models.Model):
    officer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='assignments')
    priority = models.IntegerField(default=1)
    golden_hour = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='queued')
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', '-assigned_at']


class SuspectNode(models.Model):
    node_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    node_type = models.CharField(max_length=50, default='person')
    risk_score = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)


class SuspectEdge(models.Model):
    source = models.ForeignKey(SuspectNode, on_delete=models.CASCADE, related_name='outgoing')
    target = models.ForeignKey(SuspectNode, on_delete=models.CASCADE, related_name='incoming')
    relationship = models.CharField(max_length=100)
    weight = models.FloatField(default=1.0)


class SystemLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class OTPRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_records')
    # Stored as a password hash; the raw code is sent only by email.
    otp_code = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and self.expires_at > timezone.now()
