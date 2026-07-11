import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { complaintService } from '../../services/api'

export default function ComplaintDetailsPage() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)

  useEffect(() => {
    if (id) complaintService.get(id).then(({ data }) => setComplaint(data)).catch(() => {})
  }, [id])

  if (!complaint) {
    return (
      <AppLayout title="SmartPol AI" subtitle="Case Details">
        <div className="p-lg text-primary font-mono-data animate-pulse">Loading case file...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="SmartPol AI" subtitle="Case Details">
      <div className="p-lg space-y-lg">
        <div className="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h2 className="font-display-lg-mobile text-primary">{complaint.title}</h2>
            <p className="font-mono-data text-secondary">{complaint.complaint_id}</p>
          </div>
          <Link to="/officer/investigation" className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase">
            <span className="material-symbols-outlined text-lg">psychology</span> Run AI Analysis
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="Status" value={complaint.status?.toUpperCase()} icon="info" accent="secondary" />
          <KpiCard label="Urgency" value={`${(complaint.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
          <KpiCard label="Readiness" value={`${(complaint.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="primary" />
          <KpiCard label="Fraud Class" value={complaint.fraud_classification || 'N/A'} icon="gavel" accent="secondary" />
        </div>
        <div className="glass-panel p-lg rounded-xl">
          <h3 className="font-title-sm text-on-surface mb-md">Description</h3>
          <p className="text-on-surface-variant">{complaint.description}</p>
          <div className="mt-md flex flex-wrap gap-md text-sm font-mono-data text-on-surface-variant">
            <span>Location: {complaint.location || 'Unknown'}</span>
            <span>Category: {complaint.category}</span>
            <span>Citizen: {complaint.citizen_name}</span>
          </div>
        </div>
        {complaint.entities_extracted && Object.keys(complaint.entities_extracted).length > 0 && (
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-secondary mb-md">Extracted Entities</h3>
            <pre className="text-xs font-mono-data text-on-surface-variant overflow-x-auto">{JSON.stringify(complaint.entities_extracted, null, 2)}</pre>
          </div>
        )}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-primary">Evidence Vault</h3></div>
          <DataTable
            columns={[
              { key: 'file_name', label: 'File' },
              { key: 'file_type', label: 'Type' },
              { key: 'hash_value', label: 'Hash', render: (r) => <span className="font-mono-data text-xs">{r.hash_value?.slice(0, 12)}...</span> },
              { key: 'uploaded_by_name', label: 'Uploaded By' },
            ]}
            data={complaint.evidence || []}
          />
        </div>
      </div>
    </AppLayout>
  )
}
