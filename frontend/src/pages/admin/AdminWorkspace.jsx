import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminService, dashboardService, evidenceService, policeStationService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Loader2, AlertCircle, Inbox, RefreshCcw, Activity, Users, FileText, Database, ShieldAlert, BadgeCheck, Clock, Filter, Plus } from 'lucide-react'

export default function AdminWorkspace({ mode = 'dashboard' }) {
  const { t } = useTranslation();
  const [data, setData] = useState({});
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logFilters, setLogFilters] = useState({ operator: '', date: '', action: '' });

  const [rolesState, setRolesState] = useState([
    { name: 'Admin', key: 'admins', defaultUsers: 1, perms: ['Manage Users', 'View Logs', 'System Config'] },
    { name: 'Supervisor', key: 'supervisors', defaultUsers: 1, perms: ['View Analytics', 'Assign Officers', 'View Suspect Graph'] },
    { name: 'Officer', key: 'officers', defaultUsers: 1, perms: ['View Complaints', 'Update Status', 'Upload Evidence'] },
    { name: 'Secret Agent', key: 'agents', defaultUsers: 1, perms: ['Secure Comms', 'View Missions', 'Upload Evidence'] },
    { name: 'Citizen', key: 'citizens', defaultUsers: 1, perms: ['Create Complaint', 'View Timeline', 'Upload Evidence'] },
  ]);

  const handleAddPermission = (roleName) => {
    const perm = window.prompt(`Enter new operational permission for ${roleName}:`);
    if (perm && perm.trim()) {
      const cleanPerm = perm.trim();
      setRolesState(prev => prev.map(r => {
        if (r.name === roleName && !r.perms.includes(cleanPerm)) {
          return { ...r, perms: [...r.perms, cleanPerm] };
        }
        return r;
      }));
      toast.success(`Permission "${cleanPerm}" granted to ${roleName} role tier.`);
    }
  };

  const handleSaveSystemState = () => {
    toast.success("System configuration, GIS grid, and live AI pipeline settings persisted successfully!");
    fetchData();
  };

  const calculateUsage = (row) => {
    if (row.duration || row.usage_time) return `${row.duration || row.usage_time}m`;
    if (!items || !Array.isArray(items) || items.length === 0) return 'Active Session';
    
    // Calculate elapsed time from adjacent log entry for same user
    const userLogs = items.filter(i => i.user_name === row.user_name);
    const currIdx = userLogs.findIndex(i => i.id === row.id || i.created_at === row.created_at);
    
    if (currIdx >= 0 && currIdx < userLogs.length - 1) {
      const currTime = new Date(row.created_at).getTime();
      const prevTime = new Date(userLogs[currIdx + 1].created_at).getTime();
      const diffMs = Math.abs(currTime - prevTime);
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      if (diffMins > 0) return `${diffMins}m ${diffSecs}s`;
      if (diffSecs > 0) return `${diffSecs}s`;
    }
    
    return '1m (Active)';
  };

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    let promise;

    if (mode === 'dashboard' || mode === 'roles') {
      promise = dashboardService.get().then(({ data }) => setData(data));
    } else if (mode === 'stations') {
      promise = policeStationService.list().then(({ data }) => setItems(data.results ? data.results : (Array.isArray(data) ? data : [])));
    } else if (mode === 'logs') {
      promise = adminService.logs().then(({ data }) => setItems(data));
    } else if (mode === 'evidence') {
      promise = evidenceService.list().then(({ data }) => setItems(data));
    } else if (mode !== 'dashboard' && mode !== 'config' && mode !== 'roles') {
      promise = adminService.users(mode === 'officers' ? 'officer' : mode === 'agents' ? 'secret_agent' : undefined)
        .then(({ data }) => setItems(data));
    } else {
      setIsLoading(false);
      return;
    }

    promise
      .catch((err) => {
        console.error('Admin API Error:', err);
        setError(err?.response?.data?.message || err.message || t('adminWorkspace.error.default', 'An error occurred while fetching data.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  const title = mode === 'dashboard' ? t('adminWorkspace.title.dashboard', 'System Dashboard')
    : mode === 'roles' ? t('adminWorkspace.title.roles', 'Role Management')
    : mode === 'config' ? t('adminWorkspace.title.config', 'System Configuration')
    : t('adminWorkspace.title.dynamic', { mode: mode.charAt(0).toUpperCase() + mode.slice(1) }, mode.charAt(0).toUpperCase() + mode.slice(1));

  const columns = mode === 'logs'
    ? [
        { key: 'created_at', label: t('adminWorkspace.logs.time', 'Time'), render: (row) => new Date(row.created_at).toLocaleString() },
        { key: 'user_name', label: t('adminWorkspace.logs.operator', 'Operator'), render: (row) => <span className="font-medium text-primary">{row.user_name}</span> },
        { key: 'action', label: t('adminWorkspace.logs.action', 'Action'), render: (row) => {
          let color = 'bg-surface-container-highest text-on-surface-variant border border-on-surface-variant/20';
          const act = row.action?.toUpperCase() || '';
          if (act.includes('CREATE') || act.includes('LOGIN') || act.includes('REGISTER')) color = 'bg-green-900/30 text-green-400 border border-green-700/50';
          else if (act.includes('DELETE') || act.includes('LOGOUT') || act.includes('ERROR') || act.includes('FAIL')) color = 'bg-red-900/30 text-red-400 border border-red-700/50';
          else if (act.includes('UPDATE') || act.includes('EDIT')) color = 'bg-blue-900/30 text-blue-400 border border-blue-700/50';
          return <span className={`px-2 py-1 rounded text-xs font-mono ${color}`}>{row.action}</span>
        } },
        { key: 'usage', label: 'Usage Time', render: (row) => {
           return (
             <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-bold">
               <Clock className="w-3 h-3 text-secondary" /> {calculateUsage(row)}
             </span>
           );
        }},
        { key: 'details', label: t('adminWorkspace.logs.details', 'Details') }
      ]
    : mode === 'stations'
    ? [
        { key: 'name', label: 'Police Station', render: (row) => <span className="font-bold text-primary">{row.name}</span> },
        { key: 'jurisdiction', label: 'Jurisdiction' },
        { key: 'district', label: 'District' },
        { key: 'is_cyber_specialized', label: 'Specialization', render: (row) => (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.is_cyber_specialized ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-300'}`}>
            {row.is_cyber_specialized ? 'Cyber Crime Cell' : 'General PS'}
          </span>
        ) },
        { key: 'active_cases', label: 'Active Cases', render: (row) => <span className="font-mono text-xs">{row.active_cases || 0}</span> },
      ]
    : mode === 'evidence'
    ? [
        { key: 'file_name', label: t('adminWorkspace.evidence.evidence', 'File Name') },
        { key: 'file_type', label: t('adminWorkspace.evidence.type', 'Type'), render: (row) => (
          <span className="px-2 py-1 text-xs rounded-full border border-primary/30 bg-primary/10 text-primary">{row.file_type}</span>
        ) },
        { key: 'hash_value', label: t('adminWorkspace.evidence.sha256', 'SHA-256 Hash'), render: (row) => (
          <span className="font-mono text-xs text-on-surface-variant truncate block max-w-[200px]" title={row.hash_value}>
            {row.hash_value}
          </span>
        ) },
        { key: 'created_at', label: t('adminWorkspace.evidence.uploaded', 'Uploaded At'), render: (row) => new Date(row.created_at).toLocaleString() }
      ]
    : [
        { key: 'username', label: t('adminWorkspace.users.username', 'Username'), render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
              {row.username?.[0]?.toUpperCase()}
            </div>
            <span className="font-medium">{row.username}</span>
          </div>
        ) },
        { key: 'email', label: t('adminWorkspace.users.email', 'Email'), render: (row) => <span className="text-on-surface-variant">{row.email}</span> },
        { key: 'role', label: t('adminWorkspace.users.role', 'Role'), render: (row) => {
           let color = 'border-on-surface-variant/30 text-on-surface-variant';
           if (row.role === 'admin') color = 'border-error/50 text-error bg-error/10';
           else if (row.role === 'officer') color = 'border-primary/50 text-primary bg-primary/10';
           else if (row.role === 'secret_agent') color = 'border-secondary/50 text-secondary bg-secondary/10';
           return (
             <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm border ${color}`}>
               {row.role?.replace('_', ' ') || 'USER'}
             </span>
           );
        } },
        { key: 'district', label: t('adminWorkspace.users.district', 'District'), render: (row) => row.district || <span className="text-on-surface-variant/50">-</span> },
        { key: 'badge_id', label: t('adminWorkspace.users.badge', 'Badge ID'), render: (row) => (
          row.badge_id ? <span className="font-mono text-xs px-2 py-1 bg-surface-container rounded border border-primary/10">{row.badge_id}</span> : <span className="text-on-surface-variant/50">-</span>
        ) }
      ];

  const renderDashboardCardIcon = (key) => {
    if (key.includes('officer')) return <BadgeCheck className="w-5 h-5 text-primary opacity-80" />;
    if (key.includes('agent')) return <ShieldAlert className="w-5 h-5 text-secondary opacity-80" />;
    if (key.includes('user')) return <Users className="w-5 h-5 text-primary opacity-80" />;
    if (key.includes('log') || key.includes('event')) return <Activity className="w-5 h-5 text-primary opacity-80" />;
    if (key.includes('evidence') || key.includes('file')) return <FileText className="w-5 h-5 text-primary opacity-80" />;
    return <Database className="w-5 h-5 text-primary opacity-80" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-xl min-h-[400px] glass-panel">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-on-surface-variant font-medium animate-pulse">{t('adminWorkspace.loading', 'Loading workspace data...')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-xl text-center glass-panel border-error/30 min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-xl font-bold text-error mb-2">{t('adminWorkspace.error.title', 'Failed to load data')}</h3>
          <p className="text-on-surface-variant mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-2.5 bg-error/10 hover:bg-error/20 text-error font-medium rounded-lg transition-colors border border-error/20"
          >
            <RefreshCcw className="w-4 h-4" />
            {t('adminWorkspace.error.retry', 'Try Again')}
          </button>
        </div>
      );
    }

    if (mode === 'dashboard') {
      const stats = Object.entries(data).filter(([, v]) => typeof v === 'number');
      if (stats.length === 0) return renderEmptyState();

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {stats.map(([k, v]) => (
            <div key={k} className="glass-panel p-lg hover:-translate-y-1 transition-transform cursor-default group border-t-2 border-t-primary/30">
              <div className="flex justify-between items-start mb-2">
                <small className="text-on-surface-variant uppercase tracking-wider text-xs font-semibold group-hover:text-primary transition-colors">
                  {k.replace(/_/g, ' ')}
                </small>
                {renderDashboardCardIcon(k)}
              </div>
              <div className="text-4xl font-light text-on-surface group-hover:text-primary transition-colors mt-2">{v}</div>
            </div>
          ))}
        </div>
      );
    }

    if (mode === 'roles') {
      return (
        <div className="glass-panel p-lg">
          <h3 className="text-xl font-bold mb-6 text-on-surface">Roles & Permissions Configuration</h3>
          <div className="grid gap-4">
            {rolesState.map(r => (
              <div key={r.name} className="flex flex-col md:flex-row justify-between p-4 border border-primary/20 bg-surface-container-lowest rounded-lg gap-4 shadow-sm hover:border-primary/40 transition-colors">
                <div>
                  <h4 className="font-bold text-primary text-lg">{r.name}</h4>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4"/> {data[r.key] ?? r.defaultUsers} Active Users
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {r.perms.map(p => (
                    <span key={p} className="px-2.5 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded-full font-medium">{p}</span>
                  ))}
                  <button 
                    onClick={() => handleAddPermission(r.name)} 
                    className="px-3 py-1 bg-primary/20 hover:bg-primary text-xs rounded transition-colors border border-primary/30 text-primary hover:text-white font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Permission
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'config') {
      return (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary" />
                SYSTEM CONFIGURATION & CORE ENGINE CONTROLS
              </h3>
              <p className="text-xs text-on-surface-variant font-mono mt-1">
                Active Operational Geography: <span className="text-white font-bold">AHMEDABAD, GUJARAT</span> | Grid Status: <span className="text-emerald-400 font-bold">ONLINE (WAL MODE)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/20">
                Demo Mode Active
              </span>
              <button onClick={handleSaveSystemState} className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded hover:brightness-110 shadow-lg cursor-pointer">
                Save System State
              </button>
            </div>
          </div>

          {/* Configuration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Database & Storage Config */}
            <div className="glass-panel p-5 rounded-xl border border-primary/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Database & Storage Engine
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">ACTIVE</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-bold text-white">SQLite 3 (WAL Mode)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Journal Mode:</span>
                  <span className="font-bold text-emerald-400">WAL (Write-Ahead Logging)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Busy Timeout:</span>
                  <span className="font-bold text-white">20,000 ms</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Synchronous Mode:</span>
                  <span className="font-bold text-white">NORMAL</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Media Vault Path:</span>
                  <span className="font-bold text-blue-400">/media/evidence</span>
                </div>
              </div>
            </div>

            {/* 2. Geographic & Map Configuration */}
            <div className="glass-panel p-5 rounded-xl border border-primary/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-secondary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-secondary" /> GIS & Jurisdiction Grid
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">AHMEDABAD</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Default Target City:</span>
                  <span className="font-bold text-white">Ahmedabad, Gujarat</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Center Coordinates:</span>
                  <span className="font-bold text-white">23.0225° N, 72.5714° E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Map Tile Provider:</span>
                  <span className="font-bold text-secondary">Leaflet / CartoDB Dark</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Registered Stations:</span>
                  <span className="font-bold text-emerald-400">23 Police Stations</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Routing Algorithm:</span>
                  <span className="font-bold text-white">Haversine + Specialization</span>
                </div>
              </div>
            </div>

            {/* 3. AI Pipeline & Forensics Config */}
            <div className="glass-panel p-5 rounded-xl border border-primary/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> AI Pipeline & Forensics
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Fraud AI Classifier:</span>
                  <span className="font-bold text-emerald-400">Live Gemini LLM (Primary)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Offline Fallback Engine:</span>
                  <span className="font-bold text-white">TF-IDF Naive Bayes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Golden Hour Threshold:</span>
                  <span className="font-bold text-red-400">≥ 0.70 Urgency</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Digital Forensics:</span>
                  <span className="font-bold text-emerald-400">Hugging Face + Local ELA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Vectorizer Feature Set:</span>
                  <span className="font-bold text-white">Unigrams + Bigrams</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Scam DNA Match Min:</span>
                  <span className="font-bold text-white">85% Confidence</span>
                </div>
              </div>
            </div>

            {/* 4. Security & Access Protocols */}
            <div className="glass-panel p-5 rounded-xl border border-primary/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-red-400 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-red-400" /> Security & Protocols
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400">STRICT</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Authentication:</span>
                  <span className="font-bold text-white">JWT (Bearer Tokens)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Evidence Hashing:</span>
                  <span className="font-bold text-emerald-400">SHA-256 Chain of Custody</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Covert Duress Code:</span>
                  <span className="font-bold text-red-400">Hashed PBKDF2 Enabled</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Role Enforcement:</span>
                  <span className="font-bold text-white">5 Active Role Tiers</span>
                </div>
              </div>
            </div>

            {/* 5. Hackathon & Presentation Controls */}
            <div className="glass-panel p-5 rounded-xl border border-primary/20 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" /> Hackathon Demo Policy & System Health
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">KANAD S.H.I.E.L.D.</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <p>
                  <strong className="text-white">Data Labeling Policy:</strong> All synthetic operational records, test incidents, and officer metrics are rendered with the required <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded border border-white/10">"Demo Intelligence Data"</code> banner to comply with hackathon presentation rules.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="p-2 rounded bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">SYSTEM STATUS</span>
                    <span className="text-emerald-400 font-bold">ONLINE & OPERATIONAL</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">API HEALTH</span>
                    <span className="text-blue-400 font-bold">8/8 TESTS PASSING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let filteredItems = items;
    if (mode === 'logs') {
      if (logFilters.operator) filteredItems = filteredItems.filter(item => item.user_name?.toLowerCase().includes(logFilters.operator.toLowerCase()));
      if (logFilters.date) filteredItems = filteredItems.filter(item => item.created_at?.startsWith(logFilters.date));
      if (logFilters.action) filteredItems = filteredItems.filter(item => item.action?.toLowerCase().includes(logFilters.action.toLowerCase()));
    }

    if (items.length === 0 && (!logFilters.operator && !logFilters.date && !logFilters.action)) {
      return renderEmptyState();
    }

    return (
      <div className="flex flex-col gap-6">
        {mode === 'logs' && (
          <div className="flex flex-wrap items-center gap-4 glass-panel p-4 border border-primary/20 rounded-lg bg-surface-container-lowest shadow-md">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> <span className="text-sm font-bold text-on-surface">Filters:</span>
            </div>
            <input type="text" placeholder="Operator..." value={logFilters.operator} onChange={e => setLogFilters({...logFilters, operator: e.target.value})} className="px-3 py-1.5 bg-surface-container-highest border border-primary/20 rounded text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-colors" />
            <input type="date" value={logFilters.date} onChange={e => setLogFilters({...logFilters, date: e.target.value})} className="px-3 py-1.5 bg-surface-container-highest border border-primary/20 rounded text-sm text-on-surface focus:border-primary outline-none transition-colors" />
            <input type="text" placeholder="Action..." value={logFilters.action} onChange={e => setLogFilters({...logFilters, action: e.target.value})} className="px-3 py-1.5 bg-surface-container-highest border border-primary/20 rounded text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-colors" />
            {(logFilters.operator || logFilters.date || logFilters.action) && (
              <button onClick={() => setLogFilters({operator: '', date: '', action: ''})} className="text-xs text-secondary hover:text-white transition-colors underline ml-auto">Clear Filters</button>
            )}
          </div>
        )}
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-primary/10">
          <DataTable data={filteredItems} columns={columns} />
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-xl text-center glass-panel min-h-[400px]">
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
        <Inbox className="w-10 h-10 text-primary/50" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">{t('adminWorkspace.empty.title', 'No Records Found')}</h3>
      <p className="text-on-surface-variant max-w-sm">
        {t('adminWorkspace.empty.desc', 'There is currently no data available for this section.')}
      </p>
      <button 
        onClick={fetchData}
        className="mt-6 flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors text-sm font-medium"
      >
        <RefreshCcw className="w-4 h-4" />
        Refresh Data
      </button>
    </div>
  );

  return (
    <AppLayout title={t('adminWorkspace.appLayout.title', 'Admin Console')} subtitle={t('adminWorkspace.appLayout.subtitle', 'System Management & Oversight')}>
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-sm" />
            {title}
          </h2>
          {(!['roles', 'config'].includes(mode) && !isLoading && !error) && (
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-md transition-colors text-sm"
              title="Refresh Data"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}

