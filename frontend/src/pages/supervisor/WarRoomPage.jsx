import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import InteractiveIntelligenceMap from '../../components/maps/InteractiveIntelligenceMap'
import { 
  analyticsService, policeStationService, complaintService, 
  muleService, scamDnaService, secretAgentService 
} from '../../services/api'

export default function WarRoomPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [stations, setStations] = useState([])
  const [incidents, setIncidents] = useState([])
  const [muleAlerts, setMuleAlerts] = useState([])
  const [scamPatterns, setScamPatterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agentMessages, setAgentMessages] = useState([])
  const [replyBody, setReplyBody] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [showDnaModal, setShowDnaModal] = useState(false)

  const loadAgentMessages = () => {
    secretAgentService.inbox()
      .then(({ data }) => setAgentMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [analyticsRes, stRes, compRes, muleRes, dnaRes] = await Promise.all([
          analyticsService.get(),
          policeStationService.list(),
          complaintService.list(),
          muleService.list(),
          scamDnaService.list(),
        ])
        if (mounted) {
          setData(analyticsRes.data)
          setStations(stRes.data.results ? stRes.data.results : (Array.isArray(stRes.data) ? stRes.data : []))
          setIncidents(compRes.data.results ? compRes.data.results : (Array.isArray(compRes.data) ? compRes.data : []))
          setMuleAlerts(Array.isArray(muleRes.data) ? muleRes.data : [])
          setScamPatterns(Array.isArray(dnaRes.data) ? dnaRes.data : [])
          loadAgentMessages()
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const handleSendReply = async () => {
    if (!replyBody.trim()) return
    setSendingReply(true)
    try {
      const firstAgentId = agentMessages[0]?.sender || null
      await secretAgentService.sendMessage({
        body: replyBody,
        recipient_id: firstAgentId
      })
      setReplyBody('')
      loadAgentMessages()
      toast.success('Directive securely transmitted to field agent.')
    } catch (err) {
      toast.error('Directive transmission failed.')
    } finally {
      setSendingReply(false)
    }
  }

  const renderContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (error) return (
      <div className="p-lg bg-error/10 border border-error/20 rounded-xl text-center text-error">
        <span className="material-symbols-outlined text-4xl mb-sm">error</span>
        <p>{error}</p>
      </div>
    )

    const goldenHourCount = incidents.filter(i => (i.urgency_score || 0) >= 0.7).length

    return (
      <>
        {/* Coordinated Scam Pattern Banner */}
        {(() => {
          const totalExposure = muleAlerts.reduce((acc, m) => acc + (parseFloat(m.total_amount) || 0), 0)
          const activeLocalities = Array.from(new Set(incidents.map(i => i.locality || i.location).filter(Boolean))).slice(0, 3)
          const locString = activeLocalities.length > 0 ? activeLocalities.join(', ') : 'Navrangpura, Satellite, Vastrapur'
          return (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border border-red-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-red-400 text-sm tracking-wider uppercase">POSSIBLE COORDINATED SCAM PATTERN DETECTED</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] border border-red-500/30">
                    Confidence: 94%
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Multiple UPI & Cyber Crime complaints linked to shared entity clusters across <strong className="text-white">{locString}</strong>.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Est. Financial Exposure</span>
                  <span className="text-lg font-bold text-amber-400">
                    {totalExposure > 0 ? `₹${totalExposure.toLocaleString('en-IN')}` : '₹40,70,000'}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDnaModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">hub</span>
                  Inspect Scam DNA Cluster
                </button>
              </div>
            </div>
          )
        })()}

        {/* Intelligence Top Metrics */}
        {(() => {
          const timeDiffs = incidents
            .filter(i => i.updated_at && i.created_at && i.status !== 'new' && i.status !== 'pending')
            .map(i => (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / (1000 * 60))
            .filter(diff => diff > 0)
          
          const avgRespTime = timeDiffs.length > 0 
            ? `${Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length)} mins`
            : "N/A"

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md">
              <KpiCard label="ACTIVE CASES" value={incidents.length || 0} icon="folder_open" accent="primary" />
              <KpiCard label="GOLDEN HOUR ALERTS" value={goldenHourCount} icon="notifications_active" accent="error" />
              <KpiCard label="AHMEDABAD STATIONS" value={stations.length || 0} icon="local_police" accent="secondary" />
              <KpiCard label="SCAM DNA CLUSTERS" value={scamPatterns.length || 0} icon="hub" accent="secondary" />
              <KpiCard label="MULE ACCOUNT ALERTS" value={muleAlerts.length || 0} icon="account_balance_wallet" accent="error" />
              <KpiCard label="RESPONSE TIME" value={avgRespTime} icon="timer" accent="primary" />
            </div>
          )
        })()}

        {/* Live Interactive Ahmedabad Intelligence Grid */}
        <div className="space-y-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-title-sm text-secondary flex items-center gap-sm">
              <span className="w-1.5 h-4 bg-secondary" /> LIVE AHMEDABAD INTELLIGENCE GRID & HOTSPOTS
            </h3>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
              Demo Intelligence Data — Ahmedabad Police Jurisdiction
            </span>
          </div>
          <InteractiveIntelligenceMap
            height="520px"
            stations={stations}
            incidents={incidents}
            showHeatmap={true}
          />
        </div>

        {/* Encrypted Agent Transmissions section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl space-y-md">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-md">
              <span className="w-1 h-4 bg-error" /> Encrypted Agent Transmissions
            </h3>
            
            {agentMessages.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant font-mono-data border border-dashed border-primary/20 rounded-xl">
                No active secure channels established.
              </div>
            ) : (
              <div className="space-y-sm max-h-[300px] overflow-y-auto pr-sm">
                {agentMessages.map((m, i) => {
                  const isOutgoing = m.sender === user?.id
                  return (
                    <div key={m.id || i} className={`p-md rounded border text-xs space-y-sm ${isOutgoing ? 'bg-secondary/5 border-secondary/30' : (m.is_urgent ? 'bg-error/5 border-error/30' : 'bg-surface-container-high border-outline-variant')}`}>
                      <div className="flex justify-between font-mono-data">
                        <span className={`font-bold ${isOutgoing ? 'text-secondary' : 'text-primary'}`}>
                          {isOutgoing ? 'HQ DIRECTIVE (SENT)' : `AGENT REF: ${m.sender_name || 'SECRET_AGENT'}`}
                        </span>
                        <span className="text-on-surface-variant">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-on-surface-variant font-mono-data">{m.body}</p>
                      {m.is_duress && (
                        <span className="text-[10px] bg-error text-on-error font-bold px-2 py-0.5 rounded tracking-widest animate-pulse">
                          DURESS TRIGGERED
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="glass-panel p-md rounded-xl flex flex-col justify-between">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-md">
              <span className="w-1 h-4 bg-primary" /> Command HQ Reply Portal
            </h3>
            <div className="space-y-sm flex-1 flex flex-col">
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm text-xs font-mono-data placeholder:text-outline focus:outline-none focus:border-primary flex-1 h-24"
                placeholder="Type encrypted message back to field agent..."
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
              />
              <button 
                onClick={handleSendReply}
                disabled={!replyBody.trim() || sendingReply}
                className="w-full py-sm bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingReply ? 'TRANSMITTING...' : 'SEND SECURE DIRECTIVE'}
              </button>
            </div>
          </div>
        </div>

        {/* Scam DNA Cluster Inspection Console Modal */}
        {showDnaModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#081120] rounded-xl border border-red-500/40 w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col">
              <div className="p-4 border-b border-red-500/30 flex justify-between items-center bg-red-950/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400">hub</span>
                  <h3 className="font-bold text-red-400 text-base">SCAM DNA CLUSTER INSPECTION CONSOLE</h3>
                </div>
                <button onClick={() => setShowDnaModal(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-lg space-y-md overflow-y-auto max-h-[75vh] font-mono text-xs text-slate-200">
                <div className="p-3 rounded-lg bg-slate-900 border border-red-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Target Pattern Identifier</span>
                    <span className="text-sm font-bold text-red-400">DNA-PHI-9A4B82 (Coordinated Phishing Campaign)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                    CONFIDENCE: 94%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Est. Financial Exposure</span>
                    <span className="text-lg font-bold text-amber-400">₹40,70,000</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Hotspot Jurisdictions</span>
                    <span className="text-xs font-bold text-white">Satellite, Jodhpur, Vastrapur</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-secondary uppercase block">Extracted Scam DNA Execution Sequence</span>
                  <div className="space-y-2">
                    {[
                      { step: 1, action: 'Fake SMS / Call Contact (Baiting)', confidence: '95%', desc: 'Mass SMS sent impersonating SBI NetBanking KYC requirement.' },
                      { step: 2, action: 'Credential Harvesting Portal', confidence: '92%', desc: 'Victim redirected to malicious HTTP link update-kyc-verify-login.secure-portal.com.' },
                      { step: 3, action: 'Account Takeover & OTP Interception', confidence: '89%', desc: 'Scammer extracts mobile number and transaction PIN.' },
                      { step: 4, action: 'Rapid Mule Account Transfer', confidence: '91%', desc: 'Instant multi-split UPI transfers executed to mule accounts.' },
                    ].map(s => (
                      <div key={s.step} className="p-3 rounded bg-slate-950 border border-white/10 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs shrink-0">{s.step}</span>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-xs">{s.action}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">Match: {s.confidence}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded bg-blue-950/40 border border-blue-500/30 space-y-1 text-blue-200">
                  <span className="font-bold text-xs text-blue-400 block uppercase">Recommended Tactical Response:</span>
                  <p className="text-[11px]">1. Dispatch automated 1930 Cyber Helpline freeze signal for linked mule accounts. 2. Submit domain block request to CERT-In for update-kyc-verify-login.secure-portal.com.</p>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-slate-900/60 flex justify-between items-center gap-2">
                <button 
                  onClick={() => {
                    toast.success("Emergency bank freeze & CERT-In domain block request transmitted!");
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded transition-colors cursor-pointer"
                >
                  Dispatch Emergency Freeze
                </button>
                <button 
                  onClick={() => setShowDnaModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase rounded transition-colors cursor-pointer"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('warRoom.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('warRoom.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
