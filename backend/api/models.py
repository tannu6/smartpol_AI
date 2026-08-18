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

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CITIZEN, db_index=True)
    badge_id = models.CharField(max_length=50, blank=True)
    district = models.CharField(max_length=100, default='', blank=True, db_index=True)
    avatar_url = models.URLField(blank=True)
    duress_code = models.CharField(max_length=128, blank=True)  # Hashed or plain for duress detection
    phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=True)

    def set_duress_code(self, raw_code: str):
        from django.contrib.auth.hashers import make_password
        self.duress_code = make_password(raw_code) if raw_code else ''

    def check_duress_code(self, raw_code: str) -> bool:
        from django.contrib.auth.hashers import check_password
        if not self.duress_code or not raw_code:
            return False
        # Support hashed format or legacy plain string check for backwards compatibility
        if self.duress_code.startswith(('pbkdf2_', 'argon2', 'bcrypt')):
            return check_password(raw_code, self.duress_code)
        return raw_code == self.duress_code


class PoliceStation(models.Model):
    name = models.CharField(max_length=255)
    district = models.CharField(max_length=100, default='Ahmedabad', db_index=True)
    area = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    jurisdiction = models.CharField(max_length=150)
    is_cyber_specialized = models.BooleanField(default=False)
    contact_number = models.CharField(max_length=50, blank=True)
    officer_capacity = models.IntegerField(default=10)
    active_cases = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.area})"


class Complaint(models.Model):
    STATUS_NEW = 'new'
    STATUS_TRIAGED = 'triaged'
    STATUS_ASSIGNED = 'assigned'
    STATUS_PENDING = 'pending'
    STATUS_INVESTIGATING = 'investigating'
    STATUS_UNDER_INVESTIGATION = 'under_investigation'
    STATUS_EVIDENCE_REVIEW = 'evidence_review'
    STATUS_SUPERVISOR_REVIEW = 'supervisor_review'
    STATUS_RESOLVED = 'resolved'
    STATUS_CLOSED = 'closed'
    STATUS_ESCALATED = 'escalated'

    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_TRIAGED, 'Triaged'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_INVESTIGATING, 'Investigating'),
        (STATUS_UNDER_INVESTIGATION, 'Under Investigation'),
        (STATUS_EVIDENCE_REVIEW, 'Evidence Review'),
        (STATUS_SUPERVISOR_REVIEW, 'Supervisor Review'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CLOSED, 'Closed'),
        (STATUS_ESCALATED, 'Escalated'),
    ]

    complaint_id = models.CharField(max_length=20, unique=True, db_index=True)
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General', db_index=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Geolocation & Police Station Routing additions
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    locality = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, default='Ahmedabad', db_index=True)
    jurisdiction = models.CharField(max_length=100, blank=True)
    detected_location = models.CharField(max_length=255, blank=True)
    location_source = models.CharField(max_length=50, default='manual')  # manual, map, browser
    
    assigned_station = models.ForeignKey(
        PoliceStation, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints'
    )
    assignment_explanation = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    urgency_score = models.FloatField(default=0.0, db_index=True)
    readiness_score = models.FloatField(default=0.0)
    fraud_classification = models.CharField(max_length=100, blank=True)
    entities_extracted = models.JSONField(default=dict, blank=True)
    qr_code = models.CharField(max_length=100, blank=True)
    voice_note_url = models.URLField(blank=True)
    assigned_officer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints'
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-urgency_score', '-created_at']
        indexes = [
            models.Index(fields=['status', '-urgency_score']),
            models.Index(fields=['category', '-created_at']),
        ]


class AssignmentRecord(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='assignment_records')
    station = models.ForeignKey(PoliceStation, on_delete=models.SET_NULL, null=True, blank=True)
    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    jurisdiction_score = models.FloatField(default=0.0)
    specialization_score = models.FloatField(default=0.0)
    workload_score = models.FloatField(default=0.0)
    proximity_km = models.FloatField(default=0.0)
    final_score = models.FloatField(default=0.0)
    explanation = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-assigned_at']


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
    
    # Deepfake & Forensics Analysis
    is_deepfake = models.BooleanField(default=False, null=True)
    deepfake_score = models.FloatField(default=0.0)
    deepfake_analysis = models.JSONField(default=dict, blank=True)
    
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
        ordering = ['-created_at']


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


class Operation(models.Model):
    code_name = models.CharField(max_length=100)
    description = models.TextField()
    difficulty = models.CharField(max_length=50, default='Class A')
    status = models.CharField(max_length=50, default='Active')
    progress = models.IntegerField(default=65)
    assigned_station = models.ForeignKey(PoliceStation, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code_name} ({self.status})"


class CaseTask(models.Model):
    STATUS_TODO = 'todo'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_BLOCKED = 'blocked'

    STATUS_CHOICES = [
        (STATUS_TODO, 'To Do'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_BLOCKED, 'Blocked'),
    ]

    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]

    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tasks')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.status.upper()}] {self.title} (Case: {self.complaint.complaint_id})"


class CaseNote(models.Model):
    TYPE_GENERAL = 'general'
    TYPE_INVESTIGATION = 'investigation'
    TYPE_EVIDENCE = 'evidence'
    TYPE_FINANCIAL = 'financial'
    TYPE_LEGAL = 'legal'
    TYPE_SUPERVISOR = 'supervisor'

    TYPE_CHOICES = [
        (TYPE_GENERAL, 'General'),
        (TYPE_INVESTIGATION, 'Investigation'),
        (TYPE_EVIDENCE, 'Evidence'),
        (TYPE_FINANCIAL, 'Financial'),
        (TYPE_LEGAL, 'Legal'),
        (TYPE_SUPERVISOR, 'Supervisor'),
    ]

    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='diary_notes')
    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField()
    note_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default=TYPE_INVESTIGATION)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.note_type.upper()} Note by {self.officer} on {self.complaint.complaint_id}"


class CanonicalEntity(models.Model):
    ENTITY_PHONE = 'phone'
    ENTITY_UPI = 'upi'
    ENTITY_EMAIL = 'email'
    ENTITY_DOMAIN = 'domain'
    ENTITY_ACCOUNT = 'account'

    ENTITY_TYPES = [
        (ENTITY_PHONE, 'Phone'),
        (ENTITY_UPI, 'UPI ID'),
        (ENTITY_EMAIL, 'Email'),
        (ENTITY_DOMAIN, 'Domain/URL'),
        (ENTITY_ACCOUNT, 'Bank Account'),
    ]

    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPES, db_index=True)
    original_value = models.CharField(max_length=255)
    normalized_value = models.CharField(max_length=255, db_index=True)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='canonical_entities', null=True, blank=True)
    risk_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.entity_type.upper()}: {self.normalized_value}"


class EntityRelation(models.Model):
    STATUS_REPORTED = 'reported'
    STATUS_AI_INFERRED = 'ai_inferred'
    STATUS_VERIFIED = 'verified'
    STATUS_DISMISSED = 'dismissed'

    VERIFICATION_STATUSES = [
        (STATUS_REPORTED, 'User Reported'),
        (STATUS_AI_INFERRED, 'AI Inferred'),
        (STATUS_VERIFIED, 'Verified'),
        (STATUS_DISMISSED, 'Dismissed'),
    ]

    source_entity = models.CharField(max_length=255, db_index=True)
    target_entity = models.CharField(max_length=255, db_index=True)
    relationship_type = models.CharField(max_length=100)
    confidence = models.FloatField(default=1.0)
    source_case = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='entity_relations', null=True, blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_STATUSES, default=STATUS_REPORTED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


