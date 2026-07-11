import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { ROLES } from './config/navigation'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

import ComplaintPage from './pages/citizen/ComplaintPage'
import ComplaintsListPage from './pages/citizen/ComplaintsListPage'
import ComplaintTimelinePage from './pages/citizen/ComplaintTimelinePage'
import EvidenceUploadPage from './pages/citizen/EvidenceUploadPage'

import OfficerDashboardPage from './pages/officer/OfficerDashboardPage'
import PriorityQueuePage from './pages/officer/PriorityQueuePage'
import AlertsPage from './pages/officer/AlertsPage'
import InvestigationPage from './pages/officer/InvestigationPage'
import EvidenceQueuePage from './pages/officer/EvidenceQueuePage'
import MissionControlPage from './pages/officer/MissionControlPage'
import ComplaintDetailsPage from './pages/officer/ComplaintDetailsPage'

import AnalyticsPage from './pages/supervisor/AnalyticsPage'
import WarRoomPage from './pages/supervisor/WarRoomPage'
import HeatmapPage from './pages/supervisor/HeatmapPage'
import PredictionPage from './pages/supervisor/PredictionPage'
import PatrolPage from './pages/supervisor/PatrolPage'
import FusionPage from './pages/supervisor/FusionPage'
import ScamDnaPage from './pages/supervisor/ScamDnaPage'
import MuleAccountsPage from './pages/supervisor/MuleAccountsPage'
import SuspectsPage from './pages/supervisor/SuspectsPage'

import AgentCommandPage from './pages/agent/AgentCommandPage'
import AgentChatPage from './pages/agent/AgentChatPage'
import AgentMissionsPage from './pages/agent/AgentMissionsPage'
import AgentUrgentPage from './pages/agent/AgentUrgentPage'
import AgentTimelinePage from './pages/agent/AgentTimelinePage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminOfficersPage from './pages/admin/AdminOfficersPage'
import AdminAgentsPage from './pages/admin/AdminAgentsPage'
import AdminRolesPage from './pages/admin/AdminRolesPage'
import AdminLogsPage from './pages/admin/AdminLogsPage'
import EvidenceVaultPage from './pages/admin/EvidenceVaultPage'
import AdminConfigPage from './pages/admin/AdminConfigPage'

function RootRedirect() {
  const { isAuthenticated, loading, getDefaultRoute } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-mono-data animate-pulse">INITIALIZING SECURE CORE...</div>
      </div>
    )
  }
  return <Navigate to={isAuthenticated ? getDefaultRoute() : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route path="/citizen/complaint" element={<ProtectedRoute roles={[ROLES.CITIZEN]}><ComplaintPage /></ProtectedRoute>} />
            <Route path="/citizen/complaints" element={<ProtectedRoute roles={[ROLES.CITIZEN]}><ComplaintsListPage /></ProtectedRoute>} />
            <Route path="/citizen/timeline" element={<ProtectedRoute roles={[ROLES.CITIZEN]}><ComplaintTimelinePage /></ProtectedRoute>} />
            <Route path="/citizen/timeline/:id" element={<ProtectedRoute roles={[ROLES.CITIZEN]}><ComplaintTimelinePage /></ProtectedRoute>} />
            <Route path="/citizen/evidence" element={<ProtectedRoute roles={[ROLES.CITIZEN]}><EvidenceUploadPage /></ProtectedRoute>} />

            <Route path="/officer/dashboard" element={<ProtectedRoute roles={[ROLES.OFFICER]}><OfficerDashboardPage /></ProtectedRoute>} />
            <Route path="/officer/priority" element={<ProtectedRoute roles={[ROLES.OFFICER]}><PriorityQueuePage /></ProtectedRoute>} />
            <Route path="/officer/alerts" element={<ProtectedRoute roles={[ROLES.OFFICER]}><AlertsPage /></ProtectedRoute>} />
            <Route path="/officer/investigation" element={<ProtectedRoute roles={[ROLES.OFFICER]}><InvestigationPage /></ProtectedRoute>} />
            <Route path="/officer/evidence" element={<ProtectedRoute roles={[ROLES.OFFICER]}><EvidenceQueuePage /></ProtectedRoute>} />
            <Route path="/officer/mission" element={<ProtectedRoute roles={[ROLES.OFFICER]}><MissionControlPage /></ProtectedRoute>} />
            <Route path="/officer/complaints/:id" element={<ProtectedRoute roles={[ROLES.OFFICER, ROLES.SUPERVISOR, ROLES.ADMIN]}><ComplaintDetailsPage /></ProtectedRoute>} />

            <Route path="/supervisor/analytics" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/supervisor/war-room" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><WarRoomPage /></ProtectedRoute>} />
            <Route path="/supervisor/heatmap" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><HeatmapPage /></ProtectedRoute>} />
            <Route path="/supervisor/prediction" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><PredictionPage /></ProtectedRoute>} />
            <Route path="/supervisor/patrol" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><PatrolPage /></ProtectedRoute>} />
            <Route path="/supervisor/fusion" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><FusionPage /></ProtectedRoute>} />
            <Route path="/supervisor/scam-dna" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><ScamDnaPage /></ProtectedRoute>} />
            <Route path="/supervisor/mule-accounts" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><MuleAccountsPage /></ProtectedRoute>} />
            <Route path="/supervisor/suspects" element={<ProtectedRoute roles={[ROLES.SUPERVISOR, ROLES.ADMIN]}><SuspectsPage /></ProtectedRoute>} />

            <Route path="/agent/command" element={<ProtectedRoute roles={[ROLES.SECRET_AGENT]}><AgentCommandPage /></ProtectedRoute>} />
            <Route path="/agent/chat" element={<ProtectedRoute roles={[ROLES.SECRET_AGENT]}><AgentChatPage /></ProtectedRoute>} />
            <Route path="/agent/missions" element={<ProtectedRoute roles={[ROLES.SECRET_AGENT]}><AgentMissionsPage /></ProtectedRoute>} />
            <Route path="/agent/urgent" element={<ProtectedRoute roles={[ROLES.SECRET_AGENT]}><AgentUrgentPage /></ProtectedRoute>} />
            <Route path="/agent/timeline" element={<ProtectedRoute roles={[ROLES.SECRET_AGENT]}><AgentTimelinePage /></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/officers" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminOfficersPage /></ProtectedRoute>} />
            <Route path="/admin/agents" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminAgentsPage /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminRolesPage /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminLogsPage /></ProtectedRoute>} />
            <Route path="/admin/evidence" element={<ProtectedRoute roles={[ROLES.ADMIN]}><EvidenceVaultPage /></ProtectedRoute>} />
            <Route path="/admin/config" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AdminConfigPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
