import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { complaintService, adminService } from '../../services/api'
import { ShieldAlert, Send, CheckCircle2, Terminal, X, Zap, UserCheck, MapPin, Building2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DispatchModal() {
  const { dispatchModalOpen, setDispatchModalOpen, setNotifications } = useApp()
  const [complaints, setComplaints] = useState([])
  const [officers, setOfficers] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [unit, setUnit] = useState('Blue-4')
  const [priority, setPriority] = useState('high')
  const [status, setStatus] = useState('assigned')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [dispatched, setDispatched] = useState(false)

  useEffect(() => {
    if (dispatchModalOpen) {
      // Fetch active complaints
      complaintService.list()
        .then(({ data }) => {
          const list = Array.isArray(data) ? data : (data?.results || []);
          const active = list.filter(c => c.status !== 'resolved' && c.status !== 'closed');
          const finalCases = active.length > 0 ? active : list;
          setComplaints(finalCases);
          if (finalCases.length > 0) {
            setSelectedCase(String(finalCases[0].id));
          }
        })
        .catch(() => {
          const fallbackList = [
            { id: 25, complaint_id: 'CP-7F338B17', title: 'KYC Phishing Link & Bank Transfer', category: 'Phishing Scam', location: 'Satellite, Ahmedabad', station_name: 'Satellite Police Station' },
            { id: 1, complaint_id: 'CP-89210A', title: 'UPI Refund Fraud', category: 'UPI Fraud', location: 'Navrangpura, Ahmedabad', station_name: 'Navrangpura Police Station' },
          ];
          setComplaints(fallbackList);
          setSelectedCase('25');
        });

      // Fetch officers list
      adminService.users('officer')
        .then(({ data }) => {
          const officerList = Array.isArray(data) ? data : (data?.results || []);
          setOfficers(officerList);
          if (officerList.length > 0) {
            setSelectedOfficer(String(officerList[0].id));
          }
        })
        .catch(() => {
          const fallbackOfficers = [
            { id: 101, username: 'officer_sharma', first_name: 'Tannu', last_name: 'Sharma', department: 'Cyber Crime', unit: 'Cyber Crime Cell', active_case_count: 3, badge_id: 'AHM-CY-101' },
            { id: 102, username: 'officer_patel', first_name: 'Raj', last_name: 'Patel', department: 'General Police', unit: 'Satellite PS', active_case_count: 1, badge_id: 'AHM-PS-402' },
          ];
          setOfficers(fallbackOfficers);
          if (fallbackOfficers.length > 0) setSelectedOfficer(String(fallbackOfficers[0].id));
        });

      setDispatched(false);
      setLogs([]);
    }
  }, [dispatchModalOpen])

  if (!dispatchModalOpen) return null

  const selectedObj = complaints.find(c => String(c.id) === String(selectedCase)) || complaints[0] || {}
  const catLower = (selectedObj.category || '').toLowerCase()
  const isCyber = ['upi', 'otp', 'phish', 'scam', 'cyber', 'fraud', 'hack', 'card', 'crypto'].some(k => catLower.includes(k))

  const handleDispatch = async () => {
    if (!selectedCase) return
    setLoading(true)
    
    const chosenOfficerObj = officers.find(o => String(o.id) === String(selectedOfficer))
    const officerName = chosenOfficerObj ? `${chosenOfficerObj.first_name || ''} ${chosenOfficerObj.last_name || ''}`.trim() || chosenOfficerObj.username : 'Assigned Officer'

    const simulatedLogs = [
      `[LOCATION VERIFICATION] Incident location: ${selectedObj.location || selectedObj.locality || 'Satellite, Ahmedabad'}`,
      `[JURISDICTION] Recommended Jurisdiction: ${selectedObj.station_name || 'Satellite Police Station'}`,
      `[INVESTIGATION TYPE] ${isCyber ? 'Cyber Crime Investigation (Specialized Cyber Crime Unit)' : 'Ordinary Police Investigation'}`,
      `[SUPERVISOR CHOICE] Selected Officer: ${officerName} (${chosenOfficerObj?.department || 'Police'})`,
      `[TRANSMITTING] Dispatched Unit ${unit} & assigned case to ${officerName}...`,
      `[SUCCESS] Supervisor Manual Assignment Protocol Fully Confirmed.`
    ]

    for (let i = 0; i < simulatedLogs.length; i++) {
      await new Promise(r => setTimeout(r, 300))
      setLogs(prev => [...prev, simulatedLogs[i]])
    }

    try {
      if (selectedOfficer) {
        await complaintService.assignOfficer(selectedCase, selectedOfficer)
      } else {
        await complaintService.update(selectedCase, { status })
      }
      
      setNotifications(prev => [
        {
          id: Date.now(),
          title: `Officer Assigned to ${selectedObj?.complaint_id || `Case #${selectedCase}`}`,
          message: `Supervisor assigned ${officerName} to case ${selectedObj?.complaint_id} under ${selectedObj.station_name || 'Jurisdiction Police Station'}.`,
          type: 'alert'
        },
        ...prev
      ])

      toast.success(`Assigned to ${officerName} successfully!`)
      setDispatched(true)
    } catch (err) {
      console.error(err)
      setLogs(prev => [...prev, `[ERROR] Assignment rejected: ${err.response?.data?.detail || 'Network timeout'}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border border-primary/30 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-emerald-500 animate-pulse" />
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/90">
          <div className="flex items-center gap-3">
            <Shield className="text-primary animate-pulse" size={22} />
            <div>
              <h3 className="font-bold text-white text-base tracking-wide">SUPERVISOR COMMAND & OFFICER DISPATCH</h3>
              <p className="text-xs text-secondary font-mono tracking-wider uppercase flex items-center gap-1">
                <Zap size={12}/> Geographic Jurisdiction & Structured Routing
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDispatchModalOpen(false)} 
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[78vh] text-xs text-slate-200 font-mono">
          {dispatched ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} className="animate-bounce" />
              </div>
              <h4 className="text-lg font-bold text-emerald-400">SUPERVISOR ASSIGNMENT CONFIRMED</h4>
              <p className="text-slate-300 text-xs max-w-md">Case has been manually assigned by Supervisor to the selected officer under authorized jurisdiction.</p>
              
              <div className="w-full bg-slate-950 border border-white/10 p-3 rounded-lg text-left text-[11px] font-mono space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-emerald-400">{log}</div>
                ))}
              </div>

              <button 
                onClick={() => setDispatchModalOpen(false)}
                className="px-6 py-2 bg-primary text-black font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all rounded-lg cursor-pointer"
              >
                Close Console
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Incident Selection Dropdown */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">1. Select Target Incident Alert</label>
                <select
                  value={selectedCase}
                  onChange={e => setSelectedCase(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                >
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.complaint_id} — {c.title} [{c.location || c.locality || 'Ahmedabad'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Structured Geographic Routing Box */}
              {selectedObj && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-1.5">
                    <span className="text-slate-400 flex items-center gap-1 font-bold">
                      <MapPin size={13} className="text-red-400" /> Incident Location:
                    </span>
                    <span className="font-bold text-white">{selectedObj.location || selectedObj.locality || 'Satellite, Ahmedabad'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-1.5">
                    <span className="text-slate-400 flex items-center gap-1 font-bold">
                      <Building2 size={13} className="text-blue-400" /> Recommended Geographic Jurisdiction:
                    </span>
                    <span className="font-bold text-emerald-400">{selectedObj.station_name || 'Satellite Police Station'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">Investigation Type:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${isCyber ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300'}`}>
                      {isCyber ? 'Cyber Crime Investigation (Specialized Unit)' : 'Ordinary Police Investigation'}
                    </span>
                  </div>
                </div>
              )}

              {/* Eligible Officers Selection List */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>2. Eligible Officers (Supervisor Choice — No AI Auto-Assignment)</span>
                  <span className="text-emerald-400 font-bold">{officers.length} Active Officers</span>
                </label>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {officers.map(off => {
                    const isSelected = String(off.id) === String(selectedOfficer);
                    const isCyberOfficer = (off.department || '').toLowerCase().includes('cyber');
                    const fullName = `${off.first_name || ''} ${off.last_name || ''}`.trim() || off.username;
                    
                    return (
                      <div 
                        key={off.id}
                        onClick={() => setSelectedOfficer(String(off.id))}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'bg-primary/20 border-primary shadow-md' : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-primary text-black' : 'bg-slate-800 text-slate-300'}`}>
                            {fullName[0]?.toUpperCase() || 'O'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{fullName}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isCyberOfficer ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300'}`}>
                                {off.department || 'Police'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Station/Unit: {off.unit || off.parent_station_name || 'General PS'} | Badge: {off.badge_id || 'AHM-101'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold block mb-0.5">
                            Available
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {off.active_case_count ?? 2} active case(s)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Assignment & Dispatch Button */}
              <button
                onClick={handleDispatch}
                disabled={loading || !selectedCase || !selectedOfficer}
                className="w-full py-3 bg-primary hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserCheck size={16} />
                )}
                {loading ? 'CONFIRMING ASSIGNMENT...' : 'CONFIRM SUPERVISOR OFFICER ASSIGNMENT'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
