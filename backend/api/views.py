import uuid
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Complaint, ComplaintTimeline, Evidence, Message, Notification,
    Identifier, MuleAlert, ScamDNA, OfficerAssignment, SuspectNode,
    SuspectEdge, SystemLog,
)
from .serializers import (
    UserSerializer, RegisterSerializer, ComplaintSerializer,
    ComplaintCreateSerializer, EvidenceSerializer, MessageSerializer,
    NotificationSerializer, MuleAlertSerializer, ScamDNASerializer,
    OfficerAssignmentSerializer, SystemLogSerializer,
)
from . import ai_services

User = get_user_model()


def log_action(user, action, details='', request=None):
    ip = request.META.get('REMOTE_ADDR') if request else None
    SystemLog.objects.create(user=user, action=action, details=details, ip_address=ip)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens(user)
            log_action(user, 'REGISTER', f'User {user.username} registered', request)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        user = User.objects.filter(Q(username=username) | Q(email=username)).first()
        if user and user.check_password(password):
            tokens = get_tokens(user)
            log_action(user, 'LOGIN', request=request)
            return Response({'user': UserSerializer(user).data, 'tokens': tokens})
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            log_action(user, 'PASSWORD_RESET_REQUEST', request=request)
        return Response({'detail': 'If the email exists, reset instructions have been sent.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    data = {
        'role': user.role,
        'sector': user.district,
        'timestamp': timezone.now().isoformat(),
    }

    if user.role == User.ROLE_CITIZEN:
        complaints = Complaint.objects.filter(citizen=user)
        data.update({
            'my_complaints': complaints.count(),
            'pending': complaints.filter(status='pending').count(),
            'resolved': complaints.filter(status='resolved').count(),
        })
    elif user.role == User.ROLE_OFFICER:
        assignments = OfficerAssignment.objects.filter(officer=user)
        data.update({
            'priority_queue': assignments.filter(status='queued').count(),
            'golden_hour': assignments.filter(golden_hour=True, status='queued').count(),
            'active_cases': assignments.exclude(status='completed').count(),
            'kpis': {
                'today_crimes': Complaint.objects.filter(created_at__date=timezone.now().date()).count(),
                'high_risk_areas': 8,
                'emergency_alerts': Notification.objects.filter(notification_type='alert').count(),
                'patrol_units': 114,
                'prediction_accuracy': 94.8,
            },
        })
    elif user.role == User.ROLE_SUPERVISOR:
        data.update({
            'total_complaints': Complaint.objects.count(),
            'avg_urgency': Complaint.objects.aggregate(Avg('urgency_score'))['urgency_score__avg'] or 0,
            'active_officers': User.objects.filter(role=User.ROLE_OFFICER).count(),
            'district_stats': {
                'crimes_today': Complaint.objects.filter(created_at__date=timezone.now().date()).count(),
                'resolved_rate': 78.5,
                'scam_clusters': ScamDNA.objects.count(),
            },
        })
    elif user.role == User.ROLE_SECRET_AGENT:
        data.update({
            'unread_messages': Message.objects.filter(recipient=user, read=False).count(),
            'urgent_messages': Message.objects.filter(recipient=user, is_urgent=True, read=False).count(),
            'active_missions': 3,
        })
    elif user.role == User.ROLE_ADMIN:
        data.update({
            'total_users': User.objects.count(),
            'officers': User.objects.filter(role=User.ROLE_OFFICER).count(),
            'agents': User.objects.filter(role=User.ROLE_SECRET_AGENT).count(),
            'system_logs': SystemLog.objects.count(),
        })

    return Response(data)


class ComplaintViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.ROLE_CITIZEN:
            return Complaint.objects.filter(citizen=user)
        if user.role == User.ROLE_OFFICER:
            return Complaint.objects.filter(
                Q(assigned_officer=user) | Q(assignments__officer=user)
            ).distinct()
        return Complaint.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        complaint_id = f'CP-{uuid.uuid4().hex[:8].upper()}'
        text = serializer.validated_data.get('description', '')
        category = serializer.validated_data.get('category', 'General')
        entities = ai_services.extract_entities(text)
        fraud = ai_services.classify_fraud(text, category)
        urgency = ai_services.compute_urgency_score(text, category)
        readiness = ai_services.compute_readiness_score({
            'description': text,
            'location': serializer.validated_data.get('location', ''),
            'entities_extracted': entities,
        })
        complaint = serializer.save(
            citizen=self.request.user,
            complaint_id=complaint_id,
            entities_extracted=entities,
            fraud_classification=fraud['classification'],
            urgency_score=urgency,
            readiness_score=readiness,
            qr_code=f'QR-{complaint_id}',
        )
        ComplaintTimeline.objects.create(
            complaint=complaint, event='Complaint Filed',
            description='Complaint submitted and AI analysis initiated.',
            actor=self.request.user,
        )
        officer = User.objects.filter(role=User.ROLE_OFFICER).first()
        if ai_services.golden_hour_alert(complaint) and officer:
            OfficerAssignment.objects.create(
                complaint=complaint,
                officer=officer,
                priority=1, golden_hour=True, status='queued',
            )
            Notification.objects.create(
                user=officer,
                title='Golden Hour Alert',
                message=f'High urgency complaint {complaint_id} requires immediate attention.',
                notification_type='alert', link=f'/officer/complaints/{complaint.id}',
            )
        log_action(self.request.user, 'CREATE_COMPLAINT', complaint_id, self.request)


class UploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        complaint_id = request.data.get('complaint_id')
        complaint = Complaint.objects.filter(id=complaint_id).first()
        if not complaint:
            return Response({'detail': 'Complaint not found.'}, status=404)
        file_obj = request.FILES.get('file')
        evidence = Evidence.objects.create(
            complaint=complaint,
            uploaded_by=request.user,
            file=file_obj,
            file_name=file_obj.name if file_obj else 'unknown',
            file_type=request.data.get('file_type', 'document'),
            hash_value=uuid.uuid4().hex,
        )
        ComplaintTimeline.objects.create(
            complaint=complaint, event='Evidence Uploaded',
            description=f'File {evidence.file_name} added to vault.',
            actor=request.user,
        )
        return Response(EvidenceSerializer(evidence).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def priority_view(request):
    if request.user.role not in (User.ROLE_OFFICER, User.ROLE_SUPERVISOR, User.ROLE_ADMIN):
        return Response({'detail': 'Forbidden.'}, status=403)
    assignments = OfficerAssignment.objects.filter(
        officer=request.user
    ) if request.user.role == User.ROLE_OFFICER else OfficerAssignment.objects.all()
    return Response(OfficerAssignmentSerializer(assignments[:20], many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_view(request):
    if request.user.role not in (User.ROLE_SUPERVISOR, User.ROLE_ADMIN, User.ROLE_OFFICER):
        return Response({'detail': 'Forbidden.'}, status=403)
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    daily = []
    for i in range(7):
        d = week_ago + timedelta(days=i)
        daily.append({
            'date': d.isoformat(),
            'crimes': Complaint.objects.filter(created_at__date=d).count(),
            'resolved': Complaint.objects.filter(updated_at__date=d, status='resolved').count(),
        })
    categories = Complaint.objects.values('category').annotate(count=Count('id'))
    officers = User.objects.filter(role=User.ROLE_OFFICER).annotate(
        cases=Count('assigned_complaints')
    ).values('id', 'first_name', 'last_name', 'badge_id', 'cases')[:10]
    return Response({
        'daily_trends': daily,
        'categories': list(categories),
        'officer_performance': list(officers),
        'avg_urgency': Complaint.objects.aggregate(Avg('urgency_score'))['urgency_score__avg'] or 0,
        'heatmap_points': [
            {'lat': 28.6139 + i * 0.01, 'lng': 77.2090 + i * 0.01, 'intensity': 0.3 + i * 0.1}
            for i in range(10)
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suspect_graph_view(request):
    nodes = list(SuspectNode.objects.values('node_id', 'name', 'node_type', 'risk_score', 'metadata'))
    edges = list(SuspectEdge.objects.values('source__node_id', 'target__node_id', 'relationship', 'weight'))
    formatted_edges = [
        {'source': e['source__node_id'], 'target': e['target__node_id'],
         'relationship': e['relationship'], 'weight': e['weight']}
        for e in edges
    ]
    return Response({'nodes': nodes, 'edges': formatted_edges})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mule_alerts_view(request):
    alerts = MuleAlert.objects.all()[:20]
    return Response(MuleAlertSerializer(alerts, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scam_dna_view(request):
    patterns = ScamDNA.objects.all()
    return Response(ScamDNASerializer(patterns, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def secretagent_message_view(request):
    if request.user.role != User.ROLE_SECRET_AGENT:
        return Response({'detail': 'Forbidden.'}, status=403)
    recipient_id = request.data.get('recipient_id')
    body = request.data.get('body', '')
    is_duress = request.data.get('duress_code') == request.user.duress_code and request.user.duress_code
    recipient = User.objects.filter(id=recipient_id).first() or User.objects.filter(role=User.ROLE_ADMIN).first()
    msg = Message.objects.create(
        sender=request.user, recipient=recipient, body=body,
        encrypted=True, is_urgent=request.data.get('urgent', False),
        is_duress=is_duress, subject=request.data.get('subject', 'Secure Transmission'),
    )
    if is_duress:
        log_action(request.user, 'DURESS_CODE_ACTIVATED', body, request)
        Notification.objects.create(
            user=User.objects.filter(role=User.ROLE_ADMIN).first(),
            title='DURESS ALERT',
            message=f'Agent {request.user.username} activated duress protocol.',
            notification_type='critical',
        )
    return Response(MessageSerializer(msg).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def secretagent_inbox_view(request):
    if request.user.role != User.ROLE_SECRET_AGENT:
        return Response({'detail': 'Forbidden.'}, status=403)
    messages = Message.objects.filter(recipient=request.user)
    return Response(MessageSerializer(messages[:50], many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_view(request):
    notifs = Notification.objects.filter(user=request.user)
    return Response(NotificationSerializer(notifs[:30], many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evidence_list_view(request):
    user = request.user
    if user.role == User.ROLE_CITIZEN:
        qs = Evidence.objects.filter(complaint__citizen=user)
    elif user.role == User.ROLE_OFFICER:
        qs = Evidence.objects.filter(
            Q(complaint__assigned_officer=user) | Q(complaint__assignments__officer=user)
        ).distinct()
    else:
        qs = Evidence.objects.all()
    return Response(EvidenceSerializer(qs.order_by('-created_at')[:50], many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_analyze_view(request):
    text = request.data.get('text', '')
    return Response({
        'entities': ai_services.extract_entities(text),
        'fraud': ai_services.classify_fraud(text, request.data.get('category', '')),
        'urgency': ai_services.compute_urgency_score(text, request.data.get('category', '')),
        'scam_dna': ai_services.generate_scam_dna(text),
        'mule_detection': ai_services.detect_mule_account(request.data.get('transactions', [])),
        'identifier_fusion': ai_services.fuse_identifiers(request.data.get('identifiers', [])),
    })


class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        if self.request.user.role != User.ROLE_ADMIN:
            return User.objects.none()
        role = self.request.query_params.get('role')
        qs = User.objects.all()
        if role:
            qs = qs.filter(role=role)
        return qs

    def perform_update(self, serializer):
        log_action(self.request.user, 'UPDATE_USER', serializer.instance.username, self.request)
        serializer.save()


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SystemLogSerializer

    def get_queryset(self):
        if self.request.user.role != User.ROLE_ADMIN:
            return SystemLog.objects.none()
        return SystemLog.objects.all()[:100]
