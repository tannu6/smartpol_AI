export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  SUPERVISOR: 'supervisor',
  SECRET_AGENT: 'secret_agent',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  citizen: 'roles.citizen',
  officer: 'roles.officer',
  supervisor: 'roles.supervisor',
  secret_agent: 'roles.secret_agent',
  admin: 'roles.admin',
}

export const NAV_BY_ROLE = {
  citizen: [
    { label: 'File Complaint', icon: 'edit_document', path: '/citizen/complaint', tKey: 'sidebar.fileComplaint' },
    { label: 'My Complaints', icon: 'folder_open', path: '/citizen/complaints', tKey: 'sidebar.myComplaints' },
    { label: 'Timeline', icon: 'timeline', path: '/citizen/timeline', tKey: 'nav.timeline' },
    { label: 'Upload Evidence', icon: 'cloud_upload', path: '/citizen/evidence', tKey: 'sidebar.uploadEvidence' },
    { label: 'Profile', icon: 'person', path: '/citizen/profile', tKey: 'nav.profile' },
  ],
  officer: [
    { label: 'Command Center', icon: 'dashboard', path: '/officer/dashboard', tKey: 'nav.dashboard' },
    { label: 'Priority Queue', icon: 'priority_high', path: '/officer/priority', tKey: 'nav.priority' },
    { label: 'Alerts', icon: 'emergency', path: '/officer/alerts', tKey: 'nav.alerts' },
    { label: 'Investigation', icon: 'psychology', path: '/officer/investigation', tKey: 'nav.investigation' },
    { label: 'Evidence Queue', icon: 'inventory_2', path: '/officer/evidence', tKey: 'nav.evidence' },
    { label: 'Mission Control', icon: 'local_police', path: '/officer/mission', tKey: 'nav.mission' },
  ],
  supervisor: [
    { label: 'Analytics', icon: 'monitoring', path: '/supervisor/analytics', tKey: 'nav.analytics' },
    { label: 'War Room', icon: 'hub', path: '/supervisor/war-room', tKey: 'nav.warRoom' },
    { label: 'Heatmap', icon: 'map', path: '/supervisor/heatmap', tKey: 'nav.heatmap' },
    { label: 'Crime Prediction', icon: 'auto_graph', path: '/supervisor/prediction', tKey: 'nav.prediction' },
    { label: 'Patrol', icon: 'directions_car', path: '/supervisor/patrol', tKey: 'nav.patrol' },
    { label: 'Intelligence Fusion', icon: 'hub', path: '/supervisor/fusion', tKey: 'nav.fusion' },
    { label: 'Scam DNA Lab', icon: 'biotech', path: '/supervisor/scam-dna', tKey: 'nav.scamDna' },
    { label: 'Mule Detection', icon: 'account_balance', path: '/supervisor/mule-accounts', tKey: 'nav.muleDetection' },
    { label: 'Suspect Graph', icon: 'share', path: '/supervisor/suspects', tKey: 'nav.suspects' },
  ],
  secret_agent: [
    { label: 'Command Center', icon: 'shield', path: '/agent/command', tKey: 'nav.agentCommand' },
    { label: 'Encrypted Chat', icon: 'lock', path: '/agent/chat', tKey: 'nav.encryptedChat' },
    { label: 'Missions', icon: 'flag', path: '/agent/missions', tKey: 'nav.missions' },
    { label: 'Urgent Messages', icon: 'campaign', path: '/agent/urgent', tKey: 'nav.urgentMessages' },
    { label: 'Mission Timeline', icon: 'history', path: '/agent/timeline', tKey: 'nav.missionTimeline' },
  ],
  admin: [
    { label: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/admin/dashboard', tKey: 'nav.adminDashboard' },
    { label: 'Manage Users', icon: 'group', path: '/admin/users', tKey: 'nav.manageUsers' },
    { label: 'Manage Officers', icon: 'badge', path: '/admin/officers', tKey: 'nav.manageOfficers' },
    { label: 'Manage Agents', icon: 'security', path: '/admin/agents', tKey: 'nav.manageAgents' },
    { label: 'Roles & Permissions', icon: 'key', path: '/admin/roles', tKey: 'nav.roles' },
    { label: 'System Logs', icon: 'receipt_long', path: '/admin/logs', tKey: 'nav.systemLogs' },
    { label: 'Evidence Vault', icon: 'database', path: '/admin/evidence', tKey: 'nav.evidenceVault' },
    { label: 'System Config', icon: 'settings', path: '/admin/config', tKey: 'nav.systemConfig' },
  ],
}

export const DEFAULT_ROUTE_BY_ROLE = {
  citizen: '/citizen/complaint',
  officer: '/officer/dashboard',
  supervisor: '/supervisor/analytics',
  secret_agent: '/agent/command',
  admin: '/admin/dashboard',
}
