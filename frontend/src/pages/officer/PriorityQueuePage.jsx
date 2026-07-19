import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { priorityService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'
import { useTranslation } from 'react-i18next'

export default function PriorityQueuePage() {
  const { t } = useTranslation()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    priorityService.list()
      .then(({ data }) => setQueue(Array.isArray(data) ? data : []))
      .catch(() => setQueue([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout title={t('priorityQueue.appTitle')} subtitle={t('priorityQueue.appSubtitle')}>
      <div className="p-lg space-y-lg">
        <div className="flex items-center gap-sm mb-md">
          <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
          <span className="text-error font-mono-data text-label-caps tracking-[0.2em]">{t('priorityQueue.goldenHourActive')}</span>
        </div>
        <h2 className="font-display-lg-mobile text-primary">{t('priorityQueue.title')}</h2>
        <div className="glass-panel rounded-xl overflow-hidden min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-xl h-full gap-4">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
              <p className="font-mono-data text-primary animate-pulse">{t('common.loading', 'Synchronizing Priority Queue...')}</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-xl h-full gap-4 text-center">
              <span className="material-symbols-outlined text-6xl text-primary/40">check_circle</span>
              <h3 className="font-headline-md text-primary">{t('priorityQueue.emptyTitle', 'Queue Clear')}</h3>
              <p className="text-on-surface-variant max-w-md">{t('priorityQueue.emptyDesc', 'There are currently no priority assignments in your queue. Remain on standby.')}</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'priority', label: t('priorityQueue.columns.priority', 'PRIORITY'), render: (r) => (
                  <span className={`font-bold ${r.golden_hour ? 'text-error' : 'text-secondary'}`}>P{r.priority}{r.golden_hour ? ' ⚡' : ''}</span>
                )},
                { key: 'complaint', label: t('priorityQueue.columns.case', 'CASE'), render: (r) => r.complaint?.complaint_id ? <a href={`/officer/complaints/${r.complaint.id}`} className="text-secondary hover:underline">{r.complaint.complaint_id}</a> : '—' },
                { key: 'title', label: t('priorityQueue.columns.title', 'TITLE'), render: (r) => r.complaint?.title || '—' },
                { key: 'urgency', label: t('priorityQueue.columns.urgency', 'URGENCY'), render: (r) => (
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-error" style={{ width: `${(r.complaint?.urgency_score || 0) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono-data text-on-surface-variant">{((r.complaint?.urgency_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                )},
                { key: 'readiness', label: t('priorityQueue.columns.readiness', 'READINESS'), render: (r) => (
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${(r.complaint?.readiness_score || 0) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-mono-data text-on-surface-variant">{((r.complaint?.readiness_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                )},
                { key: 'status', label: t('priorityQueue.columns.status', 'STATUS'), render: (r) => (
                  <span className="font-label-caps text-[10px] uppercase border border-primary/20 bg-primary/10 px-2 py-1 rounded">
                    {r.status}
                  </span>
                )},
              ]}
              data={queue}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
