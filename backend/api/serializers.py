from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Complaint, ComplaintTimeline, Evidence, Message, Notification,
    Identifier, MuleAlert, ScamDNA, OfficerAssignment, SuspectNode,
    SuspectEdge, SystemLog,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'badge_id', 'district', 'avatar_url', 'phone']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name',
                  'last_name', 'role', 'phone', 'district']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if data.get('role') in ('admin', 'secret_agent'):
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

    class Meta:
        model = Evidence
        fields = ['id', 'file', 'file_name', 'file_type', 'hash_value',
                  'uploaded_by_name', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    officer_name = serializers.CharField(source='assigned_officer.get_full_name', read_only=True, default='')
    timeline = ComplaintTimelineSerializer(many=True, read_only=True)
    evidence = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['complaint_id', 'urgency_score', 'readiness_score',
                            'fraud_classification', 'entities_extracted', 'qr_code']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['title', 'description', 'category', 'location']


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
