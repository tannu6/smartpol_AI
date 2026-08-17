import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { complaintService } from '../../services/api'
import { ShieldAlert, Send, CheckCircle2, Terminal, X, Zap } from 'lucide-react'

export default function DispatchModal() {
  const { dispatchModalOpen, setDispatchModalOpen, setNotifications } = useApp()
  const [complaints, setComplaints] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [unit, setUnit] = useState('Blue-4')
  const [priority, setPriority] = useState('high')
  const [status, setStatus] = useState('investigating')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [dispatched, setDispatched] = useState(false)

  useEffect(() => {
    if (dispatchModalOpen) {
      complaintService.list()
        .then(({ data }) => setComplaints(Array.isArray(data) ? data.filter(c => c.status !== 'resolved') : []))
        .catch(() => {})
      setDispatched(false)
      setLogs([])
    }
  }, [dispatchModalOpen])

  if (!dispatchModalOpen) return null

  const handleDispatch = async () => {
    if (!selectedCase) return
    setLoading(true)
    
    // Log simulation steps
    const simulatedLogs = [
      `[INIT] Establishing encrypted communication channel...`,
      `[RESOLVING] Accessing case coordinates for incident ID ${selectedCase}...`,
      `[TETHER] Allocating unit ${unit} (Priority: ${priority.toUpperCase()})...`,
      `[DISPATCH] Transmitting GPS telemetry vectors...`,
      `[SUCCESS] Tactical dispatch protocol fully operational.`
    ]

    for (let i = 0; i < simulatedLogs.length; i++) {
      await new Promise(r => setTimeout(r, 350))
      setLogs(prev => [...prev, simulatedLogs[i]])
    }

    try {
      const selectedObj = complaints.find(c => String(c.id) === String(selectedCase))
      const dispatchNote = `[TACTICAL DISPATCH] Unit ${unit} allocated under ${priority.toUpperCase()} priority. Status set to ${status.toUpperCase()}.`
      await complaintService.update(selectedCase, { 
        status,
        note: dispatchNote
      })
      
      // Update notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          title: `Tactical Unit ${unit} Dispatched`,
          message: `Unit ${unit} deployed to respond to ${selectedObj?.complaint_id || `Case #${selectedCase}`} (${selectedObj?.title || 'Active Incident'})`,
          type: 'alert'
        },
        ...prev
      ])

      toast.success(`Unit ${unit} dispatched successfully!`)
      setDispatched(true)
    } catch (err) {
      console.error(err)
      setLogs(prev => [...prev, `[ERROR] Dispatch transmission rejected: ${err.response?.data?.detail || 'Core network timeout'}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant rounded-xl w-full max-w-2xl flex flex-col shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-error animate-pulse" />
        
        {/* Header */}
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-highest">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-primary animate-pulse" />
            <div>
              <h3 className="font-bold text-on-surface text-lg">TACTICAL DISPATCH UNIT</h3>
              <p className="text-xs text-secondary font-mono-data tracking-widest uppercase flex items-center gap-1"><Zap size={12}/> Secure Grid Allocation</p>
            </div>
          </div>
          <button 
            onClick={() => setDispatchModalOpen(false)} 
            className="text-on-surface-variant hover:text-on-surface text-xl hover:bg-white/10 rounded p-1 transition-colors cursor-pointer"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Content */}
        <div className="p-lg space-y-md overflow-y-auto max-h-[75vh]">
          {dispatched ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-md">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-2">
                <CheckCircle2 size={36} className="animate-bounce" />
              </div>
              <h4 className="text-xl font-bold text-green-400">DISPATCH TRANSMITTED</h4>
              <p className="text-on-surface-variant text-sm max-w-sm">Unit {unit} has successfully acknowledged the dispatch command vectors and is en route.</p>
              
              <div className="w-full bg-black/40 border border-outline-variant p-md rounded-lg text-left text-xs font-mono-data space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-green-500/90">{log}</div>
                ))}
              </div>

              <button 
                onClick={() => setDispatchModalOpen(false)}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs tracking-widest uppercase hover:brightness-110 active:scale-95 transition-all shadow-lg rounded-lg"
              >
                Close Console
              </button>
            </div>
          ) : (
            <div className="space-y-md">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Select Target Incident Alert</label>
                <select
                  value={selectedCase}
                  onChange={e => setSelectedCase(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  <option value="">-- Choose Active Incident Code --</option>
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.complaint_id} - {c.title} ({c.category}) [{c.location || 'Unknown'}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Patrol Response Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="Blue-4">Unit Blue-4 (Patrol)</option>
                    <option value="Red-1">Unit Red-1 (S.W.A.T.)</option>
                    <option value="Gold-7">Unit Gold-7 (Cybercrime)</option>
                    <option value="Alpha-1">Unit Alpha-1 (K9 Unit)</option>
                    <option value="Delta-9">Unit Delta-9 (Traffic)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Urgency Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="low">Priority 3 - Routine</option>
                    <option value="medium">Priority 2 - High</option>
                    <option value="high">Priority 1 - Urgent Response</option>
                    <option value="emergency">Critical - S.O.S. Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Incident Allocation Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="investigating">Dispatched (Investigating)</option>
                    <option value="pending">Dispatch Queued (Pending)</option>
                    <option value="resolved">Resolved / Case Closed</option>
                  </select>
                </div>
              </div>

              {logs.length > 0 && (
                <div className="bg-black/50 border border-outline-variant p-md rounded-lg text-xs font-mono-data space-y-1 max-h-36 overflow-y-auto">
                  <div className="text-secondary/70 border-b border-outline-variant/30 pb-1 mb-1 flex items-center gap-1 uppercase tracking-widest text-[9px]"><Terminal size={12}/> Transmission Feed</div>
                  {logs.map((log, i) => (
                    <div key={i} className="text-green-500/90">{log}</div>
                  ))}
                </div>
              )}

              <button
                onClick={handleDispatch}
                disabled={loading || !selectedCase}
                className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {loading ? 'TRANSMITTING CODES...' : 'TRANSMIT TACTICAL DISPATCH'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
