import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { notificationService } from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function AlertsPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    notificationService.list()
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
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
    <AppLayout title={t('alerts.appTitle')} subtitle={t('alerts.appSubtitle')}>
      <div className="p-xl space-y-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
              <span className="text-error font-mono-data text-label-caps tracking-[0.2em]">{t('alerts.liveStatus')}</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-primary leading-tight">{t('alerts.title')}</h2>
          </div>
          <div className="glass-panel px-lg py-md rounded-xl flex items-center gap-lg">
            <div className="text-center"><p className="text-error font-mono-data text-headline-md">{activeCount}</p><p className="text-[10px] font-label-caps text-on-surface-variant">{t('alerts.activeSos')}</p></div>
            <div className="w-[1px] h-8 bg-outline-variant/20" />
            <div className="text-center"><p className="text-secondary font-mono-data text-headline-md">{alertRows.length}</p><p className="text-[10px] font-label-caps text-on-surface-variant">{t('alerts.total')}</p></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <StatCard title={t('alerts.stats.goldenHour.title')} value={String(activeCount).padStart(2, '0')} icon="emergency" priority={t('alerts.stats.goldenHour.priority')} color="error" description={t('alerts.stats.goldenHour.description')} progress={85} />
          <StatCard title={t('alerts.stats.cybercrime.title')} value={String(alertRows.filter(a => a.type?.includes('DURESS') || a.type?.includes('Golden')).length).padStart(2, '0')} icon="security" priority={t('alerts.stats.cybercrime.priority')} color="secondary" description={t('alerts.stats.cybercrime.description')} progress={40} />
          <StatCard title={t('alerts.stats.general.title')} value={String(alertRows.filter(a => a.priority === 'LOW').length).padStart(2, '0')} icon="notifications" priority={t('alerts.stats.general.priority')} color="tertiary" description={t('alerts.stats.general.description')} progress={15} />
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-primary">{t('alerts.repositoryTitle')}</h3></div>
          {loading ? (
            <div className="p-xl flex flex-col items-center justify-center gap-4 min-h-[200px]">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
              <p className="font-mono-data text-primary animate-pulse">{t('common.loading', 'Scanning for alerts...')}</p>
            </div>
          ) : alertRows.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-primary/40">notifications_off</span>
              <p>{t('alerts.noActiveAlerts', 'No active alerts in the system.')}</p>
            </div>
          ) : (
            <DataTable columns={[
              { key: 'id', label: t('alerts.columns.alertId'), render: (r) => <span className="font-mono-data text-primary">{r.id}</span> },
              { key: 'type', label: t('alerts.columns.type') },
              { key: 'priority', label: t('alerts.columns.priority'), render: (r) => (
                <span className={r.priority === 'HIGH' ? 'text-error font-bold' : r.priority === 'MEDIUM' ? 'text-secondary' : 'text-on-surface-variant'}>{r.priority}</span>
              )},
              { key: 'location', label: t('alerts.columns.link') },
              { key: 'status', label: t('alerts.columns.status') },
            ]} data={alertRows} />
          )}
        </div>
        <button className="fixed bottom-xl right-xl z-50 bg-error text-white font-black px-lg py-lg rounded-full shadow-[0_0_25px_rgba(244,67,54,0.6)] animate-pulse-red flex items-center gap-md">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <span className="font-label-caps tracking-tighter leading-tight text-left">{t('alerts.initiateEmergency1')}<br/>{t('alerts.initiateEmergency2')}</span>
        </button>
      </div>
    </AppLayout>
  )
}
