import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { complaintService } from '../../services/api'

export default function ComplaintDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (id) {
      complaintService.get(id)
        .then(({ data }) => setComplaint(data))
        .catch(() => setErrorMsg(t('common.error_occurred', 'Failed to load case file.')))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return (
      <AppLayout title="SmartPol AI" subtitle={t('complaintDetails.subtitle', 'Case Details')}>
        <div className="flex-1 p-lg flex items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      </AppLayout>
    )
  }

  if (errorMsg || !complaint) {
    return (
      <AppLayout title="SmartPol AI" subtitle={t('complaintDetails.subtitle', 'Case Details')}>
        <div className="p-xl text-center flex flex-col items-center gap-4 text-error">
          <span className="material-symbols-outlined text-6xl">error</span>
          <p className="font-mono-data">{errorMsg || t('complaintDetails.notFound', 'Case not found.')}</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="SmartPol AI" subtitle={t('complaintDetails.subtitle', 'Case Details')}>
      <div className="p-lg space-y-lg">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h2 className="font-display-lg-mobile text-primary">{complaint.title}</h2>
            <p className="font-mono-data text-secondary">{complaint.complaint_id}</p>
          </div>
          <Link to="/officer/investigation" className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase">
            <span className="material-symbols-outlined text-lg">psychology</span> {t('complaintDetails.runAI', 'Run AI Analysis')}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('complaintDetails.status', 'Status')} value={complaint.status?.toUpperCase()} icon="info" accent="secondary" />
          <KpiCard label={t('complaintDetails.urgency', 'Urgency')} value={`${(complaint.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
          <KpiCard label={t('complaintDetails.readiness', 'Readiness')} value={`${(complaint.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="primary" />
          <KpiCard label={t('complaintDetails.fraudClass', 'Fraud Class')} value={complaint.fraud_classification || 'N/A'} icon="gavel" accent="secondary" />
        </div>
        <div className="glass-panel p-lg rounded-xl">
          <h3 className="font-title-sm text-on-surface mb-md">{t('complaintDetails.description', 'Description')}</h3>
          <p className="text-on-surface-variant">{complaint.description}</p>
          <div className="mt-md flex flex-wrap gap-md text-sm font-mono-data text-on-surface-variant">
            <span>{t('complaintDetails.location', 'Location')}: {complaint.location || 'Unknown'}</span>
            <span>{t('complaintDetails.category', 'Category')}: {complaint.category}</span>
            <span>{t('complaintDetails.citizen', 'Citizen')}: {complaint.citizen_name}</span>
          </div>
        </div>
        {complaint.entities_extracted && Object.keys(complaint.entities_extracted).length > 0 && (
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-secondary mb-md">{t('complaintDetails.entities', 'Extracted Entities')}</h3>
            <pre className="text-xs font-mono-data text-on-surface-variant overflow-x-auto">{JSON.stringify(complaint.entities_extracted, null, 2)}</pre>
          </div>
        )}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-primary">{t('complaintDetails.evidenceVault', 'Evidence Vault')}</h3></div>
          <DataTable
            columns={[
              { key: 'file_name', label: t('complaintDetails.evidence.file', 'File') },
              { key: 'file_type', label: t('complaintDetails.evidence.type', 'Type') },
              { key: 'hash_value', label: t('complaintDetails.evidence.hash', 'Hash'), render: (r) => <span className="font-mono-data text-xs">{r.hash_value?.slice(0, 12)}...</span> },
              { key: 'uploaded_by_name', label: t('complaintDetails.evidence.uploadedBy', 'Uploaded By') },
            ]}
            data={complaint.evidence || []}
          />
        </div>
      </div>
    </AppLayout>
  )
}
