import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { notificationService } from '../../services/api'

export default function AlertsPage() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    notificationService.list().then(({ data }) => setNotifications(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  const alertRows = notifications.map(n => ({
    id: `AL-${n.id}`,
    type: n.title,
    priority: n.notification_type === 'critical' ? 'HIGH' : n.notification_type === 'alert' ? 'MEDIUM' : 'LOW',
    location: n.link || '—',
    status: n.read ? 'RESOLVED' : 'PENDING',
    message: n.message,
  }))

  const activeCount = alertRows.filter(a => a.status === 'PENDING').length

  return (
    <AppLayout title="SmartPol AI" subtitle="Emergency Alert Center">
      <div className="p-xl space-y-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
              <span className="text-error font-mono-data text-label-caps tracking-[0.2em]">LIVE STATUS: CRITICAL</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-primary leading-tight">Emergency Alert Center</h2>
          </div>
          <div className="glass-panel px-lg py-md rounded-xl flex items-center gap-lg">
            <div className="text-center"><p className="text-error font-mono-data text-headline-md">{activeCount}</p><p className="text-[10px] font-label-caps text-on-surface-variant">ACTIVE SOS</p></div>
            <div className="w-[1px] h-8 bg-outline-variant/20" />
            <div className="text-center"><p className="text-secondary font-mono-data text-headline-md">{alertRows.length}</p><p className="text-[10px] font-label-caps text-on-surface-variant">TOTAL</p></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <StatCard title="Golden Hour" value={String(activeCount).padStart(2, '0')} icon="emergency" priority="PRIORITY 1" color="error" description="Unresolved" progress={85} />
          <StatCard title="Cybercrime" value={String(alertRows.filter(a => a.type?.includes('DURESS') || a.type?.includes('Golden')).length).padStart(2, '0')} icon="security" priority="PRIORITY 2" color="secondary" description="Tracking" progress={40} />
          <StatCard title="General" value={String(alertRows.filter(a => a.priority === 'LOW').length).padStart(2, '0')} icon="notifications" priority="PRIORITY 3" color="tertiary" description="Advisory" progress={15} />
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-primary">ALERTS REPOSITORY</h3></div>
          {alertRows.length === 0 ? (
            <p className="p-lg text-on-surface-variant">No active alerts.</p>
          ) : (
            <DataTable columns={[
              { key: 'id', label: 'ALERT ID', render: (r) => <span className="font-mono-data text-primary">{r.id}</span> },
              { key: 'type', label: 'TYPE' },
              { key: 'priority', label: 'PRIORITY', render: (r) => (
                <span className={r.priority === 'HIGH' ? 'text-error font-bold' : r.priority === 'MEDIUM' ? 'text-secondary' : 'text-on-surface-variant'}>{r.priority}</span>
              )},
              { key: 'location', label: 'LINK' },
              { key: 'status', label: 'STATUS' },
            ]} data={alertRows} />
          )}
        </div>
        <button className="fixed bottom-xl right-xl z-50 bg-error text-white font-black px-lg py-lg rounded-full shadow-[0_0_25px_rgba(244,67,54,0.6)] animate-pulse-red flex items-center gap-md">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <span className="font-label-caps tracking-tighter leading-tight text-left">INITIATE EMERGENCY<br/>PROTOCOL</span>
        </button>
      </div>
    </AppLayout>
  )
}
