import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { adminService, dashboardService, evidenceService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, Inbox, RefreshCcw, Activity, Users, FileText, Database, ShieldAlert, BadgeCheck, Clock, Filter } from 'lucide-react'

export default function AdminWorkspace({ mode = 'dashboard' }) {
  const { t } = useTranslation();
  const [data, setData] = useState({});
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logFilters, setLogFilters] = useState({ operator: '', date: '', action: '' });

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    let promise;

    if (mode === 'dashboard') {
      promise = dashboardService.get().then(({ data }) => setData(data));
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
           // Mock usage time for demo if not provided by backend
           const mins = Math.max(1, Math.floor((new Date(row.created_at).getTime() % 100) / 2));
           return <span className="flex items-center gap-1 text-xs text-on-surface-variant"><Clock className="w-3 h-3" /> {mins}m</span>;
        }},
        { key: 'details', label: t('adminWorkspace.logs.details', 'Details') }
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
      const allRoles = [
        { name: 'Admin', users: 2, perms: ['Manage Users', 'View Logs', 'System Config'] },
        { name: 'Supervisor', users: 5, perms: ['View Analytics', 'Assign Officers', 'View Suspect Graph'] },
        { name: 'Officer', users: 24, perms: ['View Complaints', 'Update Status', 'Upload Evidence'] },
        { name: 'Secret Agent', users: 8, perms: ['Secure Comms', 'View Missions', 'Upload Evidence'] },
        { name: 'Citizen', users: 156, perms: ['Create Complaint', 'View Timeline', 'Upload Evidence'] },
      ];
      return (
        <div className="glass-panel p-lg">
          <h3 className="text-xl font-bold mb-6 text-on-surface">Roles & Permissions Configuration</h3>
          <div className="grid gap-4">
            {allRoles.map(r => (
              <div key={r.name} className="flex flex-col md:flex-row justify-between p-4 border border-primary/20 bg-surface-container-lowest rounded-lg gap-4 shadow-sm hover:border-primary/40 transition-colors">
                <div>
                  <h4 className="font-bold text-primary text-lg">{r.name}</h4>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1"><Users className="w-4 h-4"/> {r.users} Active Users</p>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  {r.perms.map(p => (
                    <span key={p} className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded-full">{p}</span>
                  ))}
                  <button className="px-3 py-1 bg-surface-container-highest hover:bg-primary/20 text-xs rounded transition-colors border border-primary/20 text-primary hover:text-white">+ Add Permission</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'config') {
      return (
        <div className="glass-panel p-xl flex flex-col items-center justify-center min-h-[300px] text-center">
          <Database className="w-16 h-16 text-primary/40 mb-4" />
          <h3 className="text-lg font-bold mb-2">System Configuration</h3>
          <p className="text-on-surface-variant max-w-md">{t('adminWorkspace.config.message', 'Advanced system configuration options will be available in the upcoming platform release.')}</p>
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

