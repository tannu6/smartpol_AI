from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r'complaints', views.ComplaintViewSet, basename='complaints')
router.register(r'admin/users', views.AdminUserViewSet, basename='admin-users')
router.register(r'admin/logs', views.SystemLogViewSet, basename='admin-logs')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/me/', views.me_view, name='me'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('upload/', views.UploadView.as_view(), name='upload'),
    path('priority/', views.priority_view, name='priority'),
    path('analytics/', views.analytics_view, name='analytics'),
    path('suspect-graph/', views.suspect_graph_view, name='suspect-graph'),
    path('mule-alerts/', views.mule_alerts_view, name='mule-alerts'),
    path('scam-dna/', views.scam_dna_view, name='scam-dna'),
    path('secretagent/message/', views.secretagent_message_view, name='secretagent-message'),
    path('secretagent/inbox/', views.secretagent_inbox_view, name='secretagent-inbox'),
    path('notifications/', views.notifications_view, name='notifications'),
    path('evidence/', views.evidence_list_view, name='evidence-list'),
    path('ai/analyze/', views.ai_analyze_view, name='ai-analyze'),
    path('', include(router.urls)),
]
