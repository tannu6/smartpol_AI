export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  SUPERVISOR: 'supervisor',
  SECRET_AGENT: 'secret_agent',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  citizen: 'Citizen',
  officer: 'Officer',
  supervisor: 'Supervisor',
  secret_agent: 'Secret Agent',
  admin: 'System Admin',
}

export const NAV_BY_ROLE = {
  citizen: [
    { label: 'File Complaint', icon: 'edit_document', path: '/citizen/complaint' },
    { label: 'My Complaints', icon: 'folder_open', path: '/citizen/complaints' },
    { label: 'Timeline', icon: 'timeline', path: '/citizen/timeline' },
    { label: 'Upload Evidence', icon: 'cloud_upload', path: '/citizen/evidence' },
  ],
  officer: [
    { label: 'Command Center', icon: 'dashboard', path: '/officer/dashboard' },
    { label: 'Priority Queue', icon: 'priority_high', path: '/officer/priority' },
    { label: 'Alerts', icon: 'emergency', path: '/officer/alerts' },
    { label: 'Investigation', icon: 'psychology', path: '/officer/investigation' },
    { label: 'Evidence Queue', icon: 'inventory_2', path: '/officer/evidence' },
    { label: 'Mission Control', icon: 'local_police', path: '/officer/mission' },
  ],
  supervisor: [
    { label: 'Analytics', icon: 'monitoring', path: '/supervisor/analytics' },
    { label: 'War Room', icon: 'hub', path: '/supervisor/war-room' },
    { label: 'Heatmap', icon: 'map', path: '/supervisor/heatmap' },
    { label: 'Crime Prediction', icon: 'auto_graph', path: '/supervisor/prediction' },
    { label: 'Patrol', icon: 'directions_car', path: '/supervisor/patrol' },
    { label: 'Intelligence Fusion', icon: 'hub', path: '/supervisor/fusion' },
    { label: 'Scam DNA Lab', icon: 'biotech', path: '/supervisor/scam-dna' },
    { label: 'Mule Detection', icon: 'account_balance', path: '/supervisor/mule-accounts' },
    { label: 'Suspect Graph', icon: 'share', path: '/supervisor/suspects' },
  ],
  secret_agent: [
    { label: 'Command Center', icon: 'shield', path: '/agent/command' },
    { label: 'Encrypted Chat', icon: 'lock', path: '/agent/chat' },
    { label: 'Missions', icon: 'flag', path: '/agent/missions' },
    { label: 'Urgent Messages', icon: 'campaign', path: '/agent/urgent' },
    { label: 'Mission Timeline', icon: 'history', path: '/agent/timeline' },
  ],
  admin: [
    { label: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/admin/dashboard' },
    { label: 'Manage Users', icon: 'group', path: '/admin/users' },
    { label: 'Manage Officers', icon: 'badge', path: '/admin/officers' },
    { label: 'Manage Agents', icon: 'security', path: '/admin/agents' },
    { label: 'Roles & Permissions', icon: 'key', path: '/admin/roles' },
    { label: 'System Logs', icon: 'receipt_long', path: '/admin/logs' },
    { label: 'Evidence Vault', icon: 'database', path: '/admin/evidence' },
    { label: 'System Config', icon: 'settings', path: '/admin/config' },
  ],
}

export const DEFAULT_ROUTE_BY_ROLE = {
  citizen: '/citizen/complaint',
  officer: '/officer/dashboard',
  supervisor: '/supervisor/analytics',
  secret_agent: '/agent/command',
  admin: '/admin/dashboard',
}
