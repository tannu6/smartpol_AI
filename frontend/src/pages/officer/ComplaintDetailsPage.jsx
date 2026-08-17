import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { complaintService } from '../../services/api'

export default function ComplaintDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { setDispatchModalOpen } = useApp()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [closureOutcome, setClosureOutcome] = useState('chargesheet')
  const [closureNotes, setClosureNotes] = useState('')
  const [courtRef, setCourtRef] = useState('')
  const [submittingClose, setSubmittingClose] = useState(false)

  useEffect(() => {
    if (id) {
      complaintService.get(id)
        .then(({ data }) => setComplaint(data))
        .catch(() => setErrorMsg(t('common.error_occurred', 'Failed to load case file.')))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleFormalCaseClose = async () => {
    if (!closureNotes.trim()) {
      toast.error('Investigation closure summary is required.')
      return
    }
    setSubmittingClose(true)
    try {
      const formattedNote = `[FORMAL CASE CLOSURE] Outcome: ${closureOutcome.toUpperCase()} | Court Ref: ${courtRef || 'N/A'} | Remarks: ${closureNotes}`
      await complaintService.update(id, {
        status: 'closed',
        note: formattedNote
      })
      setComplaint(prev => ({ 
        ...prev, 
        status: 'closed',
        timeline: [
          ...(prev.timeline || []),
          {
            id: Date.now(),
            event: `Case Closed: ${closureOutcome.replace('_', ' ').toUpperCase()}`,
            description: formattedNote,
            actor_name: 'Investigating Officer',
            created_at: new Date().toISOString()
          }
        ]
      }))
      toast.success("Case formally resolved and closed.")
      setIsCloseModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || "Failed to close case.")
    } finally {
      setSubmittingClose(false)
    }
  }

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
          <div className="flex flex-wrap gap-sm">
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="flex items-center gap-sm px-lg py-sm bg-error/20 text-error border border-error/40 hover:bg-error/30 font-bold text-xs tracking-widest uppercase transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">emergency</span> Dispatch Unit
            </button>
            {complaint.status !== 'closed' && complaint.status !== 'resolved' && (
              <button 
                onClick={() => setIsCloseModalOpen(true)} 
                className="flex items-center gap-sm px-lg py-sm border border-secondary text-secondary hover:bg-secondary/10 font-bold text-xs tracking-widest uppercase transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span> Close Case
              </button>
            )}
            <Link to="/officer/investigation" className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase">
              <span className="material-symbols-outlined text-lg">psychology</span> {t('complaintDetails.runAI', 'Run AI Analysis')}
            </Link>
          </div>
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
              { key: 'forensics', label: 'Forensics Check', render: (r) => {
                  if (!r.deepfake_analysis || Object.keys(r.deepfake_analysis).length === 0) return <span className="text-secondary text-xs font-mono-data opacity-50">Pending</span>;
                  const a = r.deepfake_analysis;
                  return (
                    <div className={`text-xs px-2 py-1 rounded w-max font-bold ${a.is_deepfake ? 'bg-error/20 text-error border border-error/50 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                      {a.is_deepfake ? '🚨 Deepfake Flagged' : '✅ Authentic'} ({(a.confidence_score * 100).toFixed(0)}%)
                      {a.is_deepfake && <p className="text-[9px] font-normal mt-1 opacity-80 max-w-[150px]">{a.anomalies_detected?.[0]}</p>}
                    </div>
                  );
              } },
              { key: 'hash_value', label: t('complaintDetails.evidence.hash', 'Hash'), render: (r) => <span className="font-mono-data text-xs">{r.hash_value?.slice(0, 12)}...</span> },
              { key: 'uploaded_by_name', label: t('complaintDetails.evidence.uploadedBy', 'Uploaded By') },
            ]}
            data={complaint.evidence || []}
          />
        </div>
      </div>

      {/* Case Resolution & Closure Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-high border border-secondary/30 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
            <div className="p-md border-b border-white/10 flex justify-between items-center bg-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">gavel</span>
                <h3 className="font-bold text-on-surface text-base">Formal Case Resolution & Closure</h3>
              </div>
              <button onClick={() => setIsCloseModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-lg space-y-md text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1 uppercase font-bold text-[10px]">Select Investigation Outcome</label>
                <select 
                  value={closureOutcome} 
                  onChange={e => setClosureOutcome(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white"
                >
                  <option value="chargesheet">Charge-Sheet Filed in Court</option>
                  <option value="accused_arrested">Accused Arrested & Sent to Judicial Custody</option>
                  <option value="evidence_verified">Forensic Evidence Verified & Case Solved</option>
                  <option value="untraced_closed">Final Report / Untraced Submitted</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase font-bold text-[10px]">Court / Charge-Sheet Reference Number (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. CS-2026-9812 / Metropolitan Court 4"
                  value={courtRef}
                  onChange={e => setCourtRef(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 uppercase font-bold text-[10px]">Investigation Closure Summary & Remarks *</label>
                <textarea 
                  rows={4}
                  placeholder="Enter detailed investigation findings, evidence verified, and final resolution summary..."
                  value={closureNotes}
                  onChange={e => setClosureNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-sm pt-sm">
                <button 
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-md py-2 border border-white/10 text-slate-300 rounded hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFormalCaseClose}
                  disabled={submittingClose || !closureNotes.trim()}
                  className="px-md py-2 bg-secondary text-on-secondary font-bold uppercase rounded hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {submittingClose ? 'Closing Case...' : 'Formally Submit & Close Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
