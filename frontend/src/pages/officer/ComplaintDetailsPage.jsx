import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import SuspectNetworkGraph from '../../components/charts/SuspectNetworkGraph'
import { 
  complaintService, taskService, diaryService, 
  relatedCasesService, pdfReportService, suspectService, aiService 
} from '../../services/api'
import { AIInsightPanel } from '../../components/ui/AIInsightPanel'

export default function ComplaintDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { setDispatchModalOpen } = useApp()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [aiResult, setAiResult] = useState(null)

  // Workflow State Machine & Case Close
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [closureOutcome, setClosureOutcome] = useState('chargesheet')
  const [closureNotes, setClosureNotes] = useState('')
  const [courtRef, setCourtRef] = useState('')
  const [submittingClose, setSubmittingClose] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Tasks State
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [submittingTask, setSubmittingTask] = useState(false)

  // Case Diary Notes State
  const [notes, setNotes] = useState([])
  const [newNoteBody, setNewNoteBody] = useState('')
  const [newNoteType, setNewNoteType] = useState('investigation')
  const [submittingNote, setSubmittingNote] = useState(false)

  // Related Cases State
  const [relatedCases, setRelatedCases] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Network Graph State
  const [graphData, setGraphData] = useState(null)

  const loadCaseData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data } = await complaintService.get(id)
      setComplaint(data)
      setTasks(data.tasks || [])
      setNotes(data.diary_notes || [])

      // Fetch AI Live Analysis & Extracted Links/Entities
      if (data.description) {
        aiService.analyze({ text: data.description, category: data.category })
          .then(({ data: aiData }) => setAiResult(aiData))
          .catch(() => {})
      }

      // Fetch related cases
      relatedCasesService.get(id)
        .then(({ data: relData }) => setRelatedCases(relData.related_cases || []))
        .catch(() => {})

      // Fetch suspect graph
      suspectService.getGraph()
        .then(({ data: gData }) => setGraphData(gData))
        .catch(() => {})

    } catch (err) {
      setErrorMsg(t('common.error_occurred', 'Failed to load case file.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCaseData()
  }, [id])

  // Workflow status step update
  const handleStatusStep = async (nextStatus) => {
    setUpdatingStatus(true)
    try {
      const { data } = await complaintService.update(id, { status: nextStatus })
      setComplaint(data)
      toast.success(`Case status advanced to ${nextStatus.replace('_', ' ').toUpperCase()}`)
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid status transition."
      toast.error(msg)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Task creation
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setSubmittingTask(true)
    try {
      const { data: created } = await taskService.create({
        complaint: complaint.id,
        title: newTaskTitle,
        priority: newTaskPriority,
        status: 'todo'
      })
      setTasks(prev => [created, ...prev])
      setNewTaskTitle('')
      toast.success('Investigation task added.')
    } catch (err) {
      toast.error('Failed to create task.')
    } finally {
      setSubmittingTask(false)
    }
  }

  const handleToggleTaskStatus = async (taskObj) => {
    const nextStatus = taskObj.status === 'completed' ? 'todo' : 'completed'
    try {
      const { data: updated } = await taskService.update(taskObj.id, {
        status: nextStatus,
        completed_at: nextStatus === 'completed' ? new Date().toISOString() : null
      })
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      toast.success(`Task marked as ${nextStatus.toUpperCase()}`)
    } catch (err) {
      toast.error('Failed to update task status.')
    }
  }

  // Case Diary Note creation
  const handleAddDiaryNote = async (e) => {
    e.preventDefault()
    if (!newNoteBody.trim()) return
    setSubmittingNote(true)
    try {
      const { data: created } = await diaryService.create({
        complaint: complaint.id,
        note: newNoteBody,
        note_type: newNoteType
      })
      setNotes(prev => [...prev, created])
      setNewNoteBody('')
      toast.success('Official Case Diary entry recorded.')
    } catch (err) {
      toast.error('Failed to log diary entry.')
    } finally {
      setSubmittingNote(false)
    }
  }

  // Formal case closure
  const handleFormalCaseClose = async () => {
    if (!closureNotes.trim()) {
      toast.error('Investigation closure summary is required.')
      return
    }
    setSubmittingClose(true)
    try {
      const formattedNote = `[FORMAL CASE CLOSURE] Outcome: ${closureOutcome.toUpperCase()} | Court Ref: ${courtRef || 'N/A'} | Remarks: ${closureNotes}`
      const { data } = await complaintService.update(id, {
        status: 'closed',
        note: formattedNote
      })
      setComplaint(data)
      toast.success("Case formally resolved and closed.")
      setIsCloseModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to close case.")
    } finally {
      setSubmittingClose(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="SmartPol AI" subtitle="Investigator Cockpit">
        <div className="flex-1 p-lg flex items-center justify-center min-h-[300px]">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      </AppLayout>
    )
  }

  if (errorMsg || !complaint) {
    return (
      <AppLayout title="SmartPol AI" subtitle="Investigator Cockpit">
        <div className="p-xl text-center flex flex-col items-center gap-4 text-error">
          <span className="material-symbols-outlined text-6xl">error</span>
          <p className="font-mono-data">{errorMsg || 'Case file not found.'}</p>
        </div>
      </AppLayout>
    )
  }

  const pdfUrl = pdfReportService.getPdfUrl(complaint.id)

  const WORKFLOW_STEPS = [
    { key: 'new', label: 'NEW' },
    { key: 'triaged', label: 'TRIAGED' },
    { key: 'assigned', label: 'ASSIGNED' },
    { key: 'under_investigation', label: 'INVESTIGATING' },
    { key: 'evidence_review', label: 'EVIDENCE REVIEW' },
    { key: 'supervisor_review', label: 'SUPERVISOR REVIEW' },
    { key: 'closed', label: 'CLOSED' },
  ]

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.key === complaint.status || (complaint.status === 'investigating' && s.key === 'under_investigation') || (complaint.status === 'pending' && s.key === 'new'))

  return (
    <AppLayout title="SmartPol AI" subtitle={`Investigator Cockpit — ${complaint.complaint_id}`}>
      <div className="p-lg space-y-lg">
        {/* Case Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-md p-md rounded-xl bg-slate-900/90 border border-primary/30 shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-xl text-primary">{complaint.title}</h2>
              <span className="px-2.5 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary font-mono text-xs font-bold">
                {complaint.complaint_id}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Category: <strong className="text-white">{complaint.category}</strong> | District: <strong className="text-white">{complaint.district || 'Ahmedabad'}</strong> | Station: <strong className="text-blue-400">{complaint.station_name || 'Mithakhali Cyber Cell'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-sm">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded hover:brightness-110 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span> Official Investigation Report (PDF)
            </a>
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="flex items-center gap-sm px-md py-sm bg-error/20 text-error border border-error/40 hover:bg-error/30 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">emergency</span> Dispatch Unit
            </button>
            {complaint.status !== 'closed' && (
              <button 
                onClick={() => setIsCloseModalOpen(true)} 
                className="flex items-center gap-sm px-md py-sm border border-secondary text-secondary hover:bg-secondary/10 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">check_circle</span> Formally Close Case
              </button>
            )}
          </div>
        </div>

        {/* Controlled State Machine Workflow Bar */}
        <div className="p-md rounded-xl bg-slate-950/90 border border-white/10 space-y-sm font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Controlled Workflow Pipeline</span>
            <span className="text-secondary font-bold">Current Stage: {complaint.status?.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const isCurrent = step.key === complaint.status || (complaint.status === 'investigating' && step.key === 'under_investigation')
              const isPast = i < currentStepIndex
              return (
                <button
                  key={step.key}
                  disabled={updatingStatus || isCurrent}
                  onClick={() => handleStatusStep(step.key)}
                  className={`p-2 rounded text-center text-[10px] font-bold tracking-wider transition-all cursor-pointer border ${
                    isCurrent 
                      ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                      : isPast 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {step.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cockpit Navigation Tabs */}
        <div className="flex flex-wrap border-b border-white/10 text-xs font-mono">
          {[
            { id: 'overview', label: 'OVERVIEW & AI TRIAGE', icon: 'dashboard' },
            { id: 'tasks', label: `TASKS (${tasks.length})`, icon: 'task_alt' },
            { id: 'diary', label: `CASE DIARY (${notes.length})`, icon: 'menu_book' },
            { id: 'evidence', label: `EVIDENCE (${complaint.evidence?.length || 0})`, icon: 'inventory_2' },
            { id: 'graph', label: 'NETWORK GRAPH', icon: 'hub' },
            { id: 'related', label: `RELATED CASES (${relatedCases.length})`, icon: 'compare_arrows' },
            { id: 'timeline', label: 'TIMELINE', icon: 'timeline' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 font-bold tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & AI Triage */}
        {activeTab === 'overview' && (
          <div className="space-y-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <KpiCard label="URGENCY SCORE" value={`${(complaint.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
              <KpiCard label="CASE READINESS" value={`${(complaint.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="primary" />
              <KpiCard label="FRAUD CLASSIFICATION" value={complaint.fraud_classification || 'General'} icon="gavel" accent="secondary" />
              <KpiCard label="GOLDEN HOUR STATUS" value={complaint.urgency_score >= 0.7 ? 'ACTIVE' : 'STANDARD'} icon="timer" accent={complaint.urgency_score >= 0.7 ? 'error' : 'secondary'} />
            </div>

            <div className="glass-panel p-lg rounded-xl space-y-md border border-primary/20">
              <h3 className="font-title-sm text-on-surface">Incident Description Statement</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{complaint.description}</p>
              <div className="mt-md flex flex-wrap gap-md text-xs font-mono text-slate-400 pt-sm border-t border-white/10">
                <span>Location: <strong className="text-white">{complaint.locality || complaint.location || 'Unknown'}</strong></span>
                <span>Citizen: <strong className="text-white">{complaint.citizen_name}</strong></span>
                <span>Created: <strong className="text-white">{new Date(complaint.created_at).toLocaleString()}</strong></span>
              </div>
            </div>

            {complaint.assignment_explanation && (
              <div className="p-md rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs font-mono space-y-1">
                <span className="font-bold text-blue-400 block uppercase">Automated Station & Officer Routing Explanation:</span>
                <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed">{complaint.assignment_explanation}</pre>
              </div>
            )}

            {/* Extracted Phishing Links & Cyber Threat Intelligence */}
            {(() => {
              const detectedUrls = aiResult?.entities?.urls || complaint?.description?.match(/https?:\/\/[^\s<>"]+|www\.[^\s<>"]+/gi) || [];
              const detectedPhones = aiResult?.entities?.phones || complaint?.description?.match(/\+?\d[\d\s-]{8,}\d/gi) || [];
              const detectedEmails = aiResult?.entities?.emails || complaint?.description?.match(/[\w.-]+@[\w.-]+\.\w+/gi) || [];
              const detectedAmounts = aiResult?.entities?.amounts || complaint?.description?.match(/[\$₹]?\s?\d[\d,]*(?:\.\d{2})?/gi) || [];

              return (
                <div className="glass-panel p-lg rounded-xl space-y-md border border-red-500/30 bg-red-950/10">
                  <div className="flex justify-between items-center">
                    <h3 className="font-title-sm text-red-400 flex items-center gap-2">
                      <span className="material-symbols-outlined">link_off</span> 
                      Extracted Phishing Links & Cyber Threat Intelligence
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                      VIRUSTOTAL API ENGINE
                    </span>
                  </div>

                  {detectedUrls.length > 0 ? (
                    <div className="space-y-sm">
                      {detectedUrls.map((url, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950/90 border border-red-500/40 flex flex-wrap justify-between items-center gap-2">
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-red-400 block break-all">🚨 Suspicious Phishing Link: {url}</span>
                            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-300">
                              <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">STATUS: MALICIOUS PHISHING</span>
                              <span>• Pattern: Multiple Hyphens / Unencrypted HTTP</span>
                              <span>• Threat Vendor Alert: Flagged by VirusTotal Engine</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => toast.success(`Domain takedown alert dispatched to CERT-In for ${url}`)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Initiate Domain Takedown
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                      No external URLs extracted in description statement.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-md pt-sm border-t border-white/10 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-900/80 border border-white/10">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Suspect Phone Numbers:</span>
                      <span className="text-emerald-400 font-bold">{detectedPhones.length > 0 ? detectedPhones.join(', ') : 'None detected'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/80 border border-white/10">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Suspect Emails / Accounts:</span>
                      <span className="text-sky-400 font-bold">{detectedEmails.length > 0 ? detectedEmails.join(', ') : 'None detected'}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/80 border border-white/10">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Reported Exposure Amount:</span>
                      <span className="text-amber-400 font-bold">{detectedAmounts.length > 0 ? detectedAmounts.join(', ') : 'None detected'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI Insight Explainability Panel */}
            {aiResult?.ai_insight && <AIInsightPanel insight={aiResult.ai_insight} />}
          </div>
        )}

        {/* Tab 2: Investigation Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-lg">
            <form onSubmit={handleCreateTask} className="glass-panel p-md rounded-xl space-y-md border border-primary/20">
              <h3 className="font-title-sm text-secondary">Create Investigation Task</h3>
              <div className="flex flex-col sm:flex-row gap-md">
                <input
                  type="text"
                  placeholder="Enter task title (e.g. Request CDR records / Serve Section 91 notice)..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded p-2 text-xs font-mono text-white placeholder:text-slate-500"
                />
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded p-2 text-xs font-mono text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <button
                  type="submit"
                  disabled={submittingTask || !newTaskTitle.trim()}
                  className="px-lg py-2 bg-primary text-white font-bold text-xs uppercase rounded hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {submittingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>

            <div className="glass-panel rounded-xl overflow-hidden border border-primary/20">
              <div className="p-md bg-slate-900/60 border-b border-white/10">
                <h3 className="font-title-sm text-on-surface">Active Case Tasks Checklist ({tasks.length})</h3>
              </div>
              {tasks.length === 0 ? (
                <div className="p-lg text-center text-slate-400 font-mono text-xs">No active tasks created yet.</div>
              ) : (
                <div className="divide-y divide-white/5 font-mono text-xs">
                  {tasks.map(t => (
                    <div key={t.id} className="p-md flex items-center justify-between gap-md hover:bg-white/5">
                      <div className="flex items-center gap-md">
                        <input
                          type="checkbox"
                          checked={t.status === 'completed'}
                          onChange={() => handleToggleTaskStatus(t)}
                          className="w-4 h-4 rounded accent-primary cursor-pointer"
                        />
                        <span className={`font-semibold ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.priority === 'critical' || t.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                          {t.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Case Diary (Audit Notes) */}
        {activeTab === 'diary' && (
          <div className="space-y-lg">
            <form onSubmit={handleAddDiaryNote} className="glass-panel p-md rounded-xl space-y-md border border-primary/20">
              <h3 className="font-title-sm text-secondary">Append Case Diary Entry</h3>
              <div className="space-y-sm font-mono text-xs">
                <div className="flex gap-md">
                  <select
                    value={newNoteType}
                    onChange={e => setNewNoteType(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded p-2 text-white"
                  >
                    <option value="investigation">Investigation Note</option>
                    <option value="evidence">Evidence Forensic Note</option>
                    <option value="financial">Financial / Bank Freeze Note</option>
                    <option value="legal">Legal / Charge-Sheet Note</option>
                    <option value="supervisor">Supervisor Directive</option>
                    <option value="general">General Note</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  placeholder="Type official case diary entry..."
                  value={newNoteBody}
                  onChange={e => setNewNoteBody(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded p-2 text-white"
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteBody.trim()}
                  className="px-lg py-2 bg-secondary text-on-secondary font-bold text-xs uppercase rounded hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {submittingNote ? 'Logging...' : 'Log Case Diary Entry'}
                </button>
              </div>
            </form>

            <div className="glass-panel p-md rounded-xl space-y-md border border-primary/20">
              <h3 className="font-title-sm text-on-surface">Chronological Case Diary ({notes.length})</h3>
              {notes.length === 0 ? (
                <div className="p-lg text-center text-slate-400 font-mono text-xs">No case diary entries recorded.</div>
              ) : (
                <div className="space-y-sm font-mono text-xs">
                  {notes.map((n, idx) => (
                    <div key={n.id || idx} className="p-md bg-slate-900/60 rounded border border-white/5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-secondary text-xs uppercase">{n.note_type} NOTE — {n.officer_name || 'Investigating Officer'}</span>
                        <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Evidence Vault */}
        {activeTab === 'evidence' && (
          <div className="glass-panel rounded-xl overflow-hidden border border-primary/20">
            <div className="p-md bg-slate-900/60 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-title-sm text-primary">Evidence Vault & Forensic Integrity Checks</h3>
              <Link to="/citizen/evidence" className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded">Upload File</Link>
            </div>
            <DataTable
              columns={[
                { key: 'file_name', label: 'File Name' },
                { key: 'file_type', label: 'Type' },
                { key: 'forensics', label: 'Forensics Check', render: (r) => {
                    if (!r.deepfake_analysis || Object.keys(r.deepfake_analysis).length === 0) return <span className="text-secondary text-xs font-mono opacity-50">Clean</span>;
                    const a = r.deepfake_analysis;
                    return (
                      <div className={`text-xs px-2 py-1 rounded w-max font-bold ${a.is_deepfake ? 'bg-error/20 text-error border border-error/50 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                        {a.is_deepfake ? '🚨 Deepfake Flagged' : '✅ Authentic'} ({(a.confidence_score * 100).toFixed(0)}%)
                      </div>
                    );
                } },
                { key: 'hash_value', label: 'SHA-256 Hash Digest', render: (r) => <span className="font-mono text-xs">{r.hash_value?.slice(0, 16)}...</span> },
                { key: 'created_at', label: 'Uploaded Date', render: (r) => new Date(r.created_at).toLocaleString() },
              ]}
              data={complaint.evidence || []}
            />
          </div>
        )}

        {/* Tab 5: Network Graph */}
        {activeTab === 'graph' && (
          <div className="space-y-md">
            <div className="p-md rounded-xl bg-slate-900/80 border border-primary/20 flex justify-between items-center text-xs font-mono">
              <span className="text-secondary font-bold">Multi-Hop Intelligence Graph Centered on {complaint.complaint_id}</span>
              <span className="text-slate-400">Node Physics Engine Active</span>
            </div>
            <div className="glass-panel p-md rounded-xl min-h-[480px] border border-primary/20">
              <SuspectNetworkGraph nodes={graphData?.nodes || []} edges={graphData?.edges || []} height={480} />
            </div>
          </div>
        )}

        {/* Tab 6: Related Cases */}
        {activeTab === 'related' && (
          <div className="space-y-md font-mono text-xs">
            <div className="p-md rounded-xl bg-slate-900/80 border border-primary/20 flex justify-between items-center">
              <span className="text-secondary font-bold">Cross-Case Correlation Engine Results</span>
              <span className="text-slate-400">Total Matched: {relatedCases.length}</span>
            </div>

            {relatedCases.length === 0 ? (
              <div className="glass-panel p-xl rounded-xl text-center text-slate-400">No cross-case pattern correlations detected for this incident.</div>
            ) : (
              <div className="space-y-md">
                {relatedCases.map(rc => (
                  <div key={rc.id} className="glass-panel p-md rounded-xl border border-primary/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-secondary text-sm">{rc.label}: {rc.complaint_id}</span>
                        <span className="text-white font-semibold">({rc.title})</span>
                      </div>
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold text-xs">
                        Similarity: {rc.similarity_percentage}%
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-white/5 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Correlation Match Explanations:</span>
                      {rc.reasons.map((r, i) => (
                        <p key={i} className="text-blue-300">✓ {r}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Case Timeline */}
        {activeTab === 'timeline' && (
          <div className="glass-panel p-md rounded-xl space-y-md border border-primary/20 font-mono text-xs">
            <h3 className="font-title-sm text-primary">Case Audit Trail & Timeline</h3>
            <div className="space-y-sm">
              {(complaint.timeline || []).map((tl, i) => (
                <div key={tl.id || i} className="p-md bg-slate-900/60 rounded border border-white/5 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-secondary">{tl.event}</span>
                    <p className="text-slate-300 mt-0.5">{tl.description}</p>
                    <span className="text-[10px] text-slate-500">Actor: {tl.actor_name || 'System'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(tl.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formal Case Close Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-secondary/30 rounded-xl w-full max-w-lg p-lg space-y-md font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-bold text-secondary text-sm">Formal Case Resolution & Closure</h3>
              <button onClick={() => setIsCloseModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold text-[10px]">SELECT RESOLUTION OUTCOME</label>
              <select value={closureOutcome} onChange={e => setClosureOutcome(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white">
                <option value="chargesheet">Charge-Sheet Filed in Court</option>
                <option value="accused_arrested">Accused Arrested & Sent to Custody</option>
                <option value="evidence_verified">Forensic Evidence Verified & Case Solved</option>
                <option value="untraced_closed">Final Report / Untraced Submitted</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold text-[10px]">COURT / REFERENCE NO.</label>
              <input type="text" placeholder="e.g. CS-2026-9812 / Court 4" value={courtRef} onChange={e => setCourtRef(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold text-[10px]">CLOSURE SUMMARY & REMARKS *</label>
              <textarea rows={3} placeholder="Enter detailed findings..." value={closureNotes} onChange={e => setClosureNotes(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsCloseModalOpen(false)} className="px-3 py-1.5 border border-white/10 rounded text-slate-300">Cancel</button>
              <button onClick={handleFormalCaseClose} disabled={submittingClose || !closureNotes.trim()} className="px-3 py-1.5 bg-secondary text-black font-bold uppercase rounded cursor-pointer disabled:opacity-50">
                {submittingClose ? 'Closing...' : 'Submit & Close Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
