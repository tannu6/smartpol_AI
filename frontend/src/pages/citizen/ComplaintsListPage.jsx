import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { complaintService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'
import { useTranslation } from 'react-i18next'

export default function ComplaintsListPage() {
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  useEffect(() => {
    complaintService.list().then(({ data }) => {
      setComplaints(Array.isArray(data) ? data : data.results || [])
    })
    .catch(err => {
      console.error(err)
      setError(t('errors.generic'))
    })
    .finally(() => setLoading(false))
  }, [t])

  const columns = [
    { key: 'complaint_id', label: t('complaints.table.id'), render: (r) => <span className="font-mono-data text-secondary">{r.complaint_id}</span> },
    { key: 'title', label: t('complaints.table.title') },
    { key: 'category', label: t('complaints.table.category') },
    { key: 'status', label: t('complaints.table.status'), render: (r) => (
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${r.status === 'resolved' ? 'text-secondary bg-secondary/10' : r.status === 'investigating' ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>{r.status}</span>
    )},
    { key: 'urgency_score', label: t('complaints.table.urgency'), render: (r) => `${(r.urgency_score * 100).toFixed(0)}%` },
    { key: 'actions', label: t('complaints.table.actions'), render: (r) => <Link to={`/citizen/timeline/${r.id}`} className="text-primary text-xs hover:text-secondary">{t('complaints.timeline_link')}</Link> },
  ]

  return (
    <AppLayout title="SmartPol AI" subtitle={t('complaints.title')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('complaints.title')}</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-xl gap-4">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
            <p className="font-mono-data text-primary animate-pulse">{t('common.loading', 'Initializing Secure Link...')}</p>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-xl p-xl flex flex-col items-center justify-center text-center gap-md border border-error/20 bg-error/5">
            <span className="material-symbols-outlined text-6xl text-error/40">error</span>
            <p className="text-error">{error}</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel rounded-xl p-xl flex flex-col items-center justify-center text-center gap-md border border-primary/20 bg-primary/5">
            <span className="material-symbols-outlined text-6xl text-primary/40">assignment_add</span>
            <h3 className="font-headline-md text-primary">{t('complaints.empty_title', 'No Complaints Found')}</h3>
            <p className="text-on-surface-variant max-w-md">{t('complaints.empty_desc', 'You have not submitted any cybercrime complaints yet. If you are a victim of a scam, please file a report immediately.')}</p>
            <Link to="/citizen/complaint" className="mt-sm bg-primary/20 text-primary border border-primary/40 px-6 py-2 rounded font-label-caps hover:bg-primary/30 transition-colors">
              {t('complaints.empty_cta', 'FILE A COMPLAINT')}
            </Link>
          </div>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden">
            <DataTable columns={columns} data={complaints} />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
