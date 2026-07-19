import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { DataTable } from '../../components/ui/DataTable'
import axios from 'axios'
import { Lock, ShieldAlert, FileText, CheckCircle } from 'lucide-react'

export default function AnonymousTipsPage() {
  const { t } = useTranslation()
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [selectedTip, setSelectedTip] = useState(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateCategory, setUpdateCategory] = useState('')
  const [updateRisk, setUpdateRisk] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchTips = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/v1/officer/anonymous-tips/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setTips(res.data)
    } catch (err) {
      setError('Failed to fetch secure anonymous tips queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTips()
  }, [])

  const handleUpdate = async () => {
    if (!selectedTip) return
    try {
      setSaving(true)
      await axios.put(`/api/v1/officer/anonymous-tips/${selectedTip.id}/`, {
        status: updateStatus,
        category: updateCategory,
        risk_level: updateRisk,
        notes: updateNotes
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSelectedTip(null)
      fetchTips()
    } catch (err) {
      console.error(err)
      alert('Failed to update case.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'tracking_id', label: 'CASE ID', render: r => <span className="font-mono-data text-primary font-bold">{r.tracking_id}</span> },
    { key: 'created_at', label: 'RECEIVED', render: r => <span className="text-on-surface-variant text-xs">{new Date(r.created_at).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span> },
    { key: 'category', label: 'CATEGORY', render: r => <span className="uppercase text-xs font-bold text-on-surface">{r.category}</span> },
    { key: 'risk_level', label: 'RISK LEVEL', render: r => <span className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold ${r.risk_level === 'critical' ? 'bg-error/20 text-error border border-error/50' : r.risk_level === 'high' ? 'bg-error-container text-on-error-container' : 'bg-surface-variant text-on-surface-variant'}`}>{r.risk_level}</span> },
    { key: 'status', label: 'STATUS', render: r => <span className="uppercase text-xs font-bold text-secondary">{r.status}</span> },
    { key: 'actions', label: '', render: r => (
      <button 
        onClick={() => {
          setSelectedTip(r)
          setUpdateStatus(r.status)
          setUpdateCategory(r.category)
          setUpdateRisk(r.risk_level)
          setUpdateNotes(r.notes || '')
        }}
        className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 text-xs font-bold transition-colors"
      >
        REVIEW
      </button>
    )}
  ]

  return (
    <AppLayout title="Anonymous Tips Queue" subtitle="RESTRICTED CLEARANCE">
      <div className="space-y-md max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-lg border-b border-primary/20 pb-md">
          <div className="flex items-center space-x-md">
            <Lock className="text-primary w-8 h-8" />
            <div>
              <h2 className="font-display-lg-mobile text-primary uppercase drop-shadow-md">
                Secure Anonymous Tips
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">Review confidential intelligence submitted by anonymous citizens. Sender identities are strictly detached.</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : error ? (
          <div className="p-md bg-error/10 border border-error/20 text-error rounded-lg flex items-center gap-3">
            <ShieldAlert /> {error}
          </div>
        ) : tips.length === 0 ? (
          <div className="p-xl border border-dashed border-primary/30 rounded-xl text-center text-on-surface-variant">
            No active anonymous tips in the queue.
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-lg">
            <DataTable columns={columns} data={tips} />
          </div>
        )}

        {/* REVIEW MODAL */}
        {selectedTip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container-high border border-outline-variant rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-highest">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-error" />
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">CASE: {selectedTip.tracking_id}</h3>
                    <p className="text-xs text-error font-mono-data tracking-widest uppercase">Strictly Confidential</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTip(null)} className="text-on-surface-variant hover:text-on-surface font-bold text-xl">&times;</button>
              </div>

              <div className="p-lg overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-lg">
                
                {/* Left Col: Message */}
                <div className="space-y-md">
                  <div className="bg-surface-container-lowest border border-primary/20 p-md rounded-lg relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <h4 className="text-xs text-primary font-bold uppercase mb-2 flex items-center gap-2"><FileText size={14}/> Decrypted Payload</h4>
                    <p className="text-on-surface font-mono-data text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedTip.body}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-md">
                    <div className="bg-surface-container border border-outline-variant p-sm rounded">
                      <div className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Timestamp</div>
                      <div className="text-sm font-mono-data text-on-surface">{new Date(selectedTip.created_at).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="bg-surface-container border border-outline-variant p-sm rounded">
                      <div className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Evidence Status</div>
                      <div className="text-sm font-mono-data text-on-surface opacity-50">No Attachments</div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Investigation Controls */}
                <div className="space-y-md bg-surface-container p-md rounded-lg border border-outline-variant">
                  <h4 className="text-xs text-secondary font-bold uppercase mb-4 flex items-center gap-2 border-b border-outline-variant pb-2"><CheckCircle size={14}/> Investigation Workflow</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Status</label>
                    <select 
                      value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="restricted">Restricted / Unread</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="escalated">Escalated</option>
                      <option value="archived">Archived / Closed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Category</label>
                      <select 
                        value={updateCategory} onChange={e => setUpdateCategory(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="general">General</option>
                        <option value="fraud">Financial Fraud</option>
                        <option value="cyber">Cyber Crime</option>
                        <option value="narcotics">Narcotics</option>
                        <option value="violence">Violence/Threat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Risk Level</label>
                      <select 
                        value={updateRisk} onChange={e => setUpdateRisk(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                      >
                        <option value="unknown">Unknown</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Internal Officer Notes</label>
                    <textarea 
                      value={updateNotes} onChange={e => setUpdateNotes(e.target.value)}
                      placeholder="Add investigation notes here... (Not visible to sender)"
                      className="w-full h-32 bg-surface-container-highest border border-outline-variant rounded p-3 text-sm text-on-surface font-mono-data focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="w-full py-3 bg-secondary text-on-secondary font-bold text-sm uppercase tracking-widest rounded hover:bg-secondary-container transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Save Case File'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
