from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    Complaint, ComplaintTimeline, Evidence, Message, Notification,
    Identifier, MuleAlert, ScamDNA, OfficerAssignment, SuspectNode,
    SuspectEdge, SystemLog, PoliceStation, AssignmentRecord,
)

User = get_user_model()


class PoliceStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceStation
        fields = '__all__'


class AssignmentRecordSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True, default='')
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True, default='')

    class Meta:
        model = AssignmentRecord
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'badge_id', 'district', 'avatar_url', 'phone', 'is_verified']
        read_only_fields = ['id', 'is_verified']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'district', 'avatar_url', 'phone', 'badge_id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name',
                  'last_name', 'role', 'phone', 'district', 'badge_id']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        try:
            validate_password(data['password'])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        if User.objects.filter(email__iexact=data['email']).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists.'})
        # In production this would be restricted, but for MVP let them register roles
        if data.get('role') in ('admin', 'secret_agent'):
            data['role'] = User.ROLE_CITIZEN
        elif 'role' not in data:
            data['role'] = User.ROLE_CITIZEN
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ComplaintTimelineSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True, default='System')

    class Meta:
        model = ComplaintTimeline
        fields = ['id', 'event', 'description', 'actor_name', 'created_at']


class EvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    complaint_code = serializers.CharField(source='complaint.complaint_id', read_only=True)
    complaint_id = serializers.IntegerField(source='complaint.id', read_only=True)

    class Meta:
        model = Evidence
        fields = ['id', 'file', 'file_name', 'file_type', 'hash_value',
                  'uploaded_by_name', 'created_at', 'complaint_code', 'complaint_id',
                  'is_deepfake', 'deepfake_score', 'deepfake_analysis']


class ComplaintSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    officer_name = serializers.CharField(source='assigned_officer.get_full_name', read_only=True, default='')
    station_name = serializers.CharField(source='assigned_station.name', read_only=True, default='')
    timeline = ComplaintTimelineSerializer(many=True, read_only=True)
    evidence = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['complaint_id', 'urgency_score', 'readiness_score',
                            'fraud_classification', 'entities_extracted', 'qr_code',
                            'assigned_station', 'assignment_explanation']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'category', 'location',
                  'latitude', 'longitude', 'address', 'locality', 'district', 'location_source']

    def validate_title(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError('Use a title of at least 5 characters.')
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 20:
            raise serializers.ValidationError('Provide at least 20 characters of incident detail.')
        return value


class ComplaintStatusSerializer(serializers.ModelSerializer):
    note = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=1000)

    class Meta:
        model = Complaint
        fields = ['status', 'assigned_officer', 'note']

    def validate_status(self, value):
        valid = [c[0] for c in Complaint.STATUS_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f'Invalid status. Must be one of: {", ".join(valid)}')
        return value

    def validate_assigned_officer(self, value):
        if value and value.role not in (User.ROLE_OFFICER, User.ROLE_SUPERVISOR):
            raise serializers.ValidationError('A complaint can only be assigned to an officer or supervisor.')
        return value


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender', 'encrypted']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class IdentifierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Identifier
        fields = '__all__'


class MuleAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuleAlert
        fields = '__all__'


class ScamDNASerializer(serializers.ModelSerializer):
    class Meta:
        model = ScamDNA
        fields = '__all__'


class OfficerAssignmentSerializer(serializers.ModelSerializer):
    complaint = ComplaintSerializer(read_only=True)
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)

    class Meta:
        model = OfficerAssignment
        fields = '__all__'


class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True, default='System')

    class Meta:
        model = SystemLog
        fields = '__all__'


class OperationSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='assigned_station.name', read_only=True)

    class Meta:
        from .models import Operation
        model = Operation
        fields = '__all__'

