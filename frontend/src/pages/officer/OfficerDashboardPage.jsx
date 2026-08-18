import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { CrimeTrendChart, CategoryPieChart } from '../../components/charts/Charts'
import { DataTable, TableSection } from '../../components/ui/DataTable'
import InteractiveIntelligenceMap from '../../components/maps/InteractiveIntelligenceMap'
import { dashboardService, complaintService, policeStationService, secretAgentService } from '../../services/api'

export default function OfficerDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [stations, setStations] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [agentMessages, setAgentMessages] = useState([])
  const [replyBody, setReplyBody] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const loadAgentMessages = () => {
    secretAgentService.inbox()
      .then(({ data }) => setAgentMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      dashboardService.get(),
      complaintService.list(),
      policeStationService.list()
    ])
    .then(([dashRes, compRes, stRes]) => {
      setDashboard(dashRes.data)
      const incidentData = compRes.data.results ? compRes.data.results : (Array.isArray(compRes.data) ? compRes.data : [])
      setIncidents(incidentData)
      if (incidentData.length > 0) setSelectedCase(incidentData[0])
      const stationData = stRes.data.results ? stRes.data.results : (Array.isArray(stRes.data) ? stRes.data : [])
      setStations(stationData)
      loadAgentMessages()
    })
    .catch(() => {})
    .finally(() => setLoading(false))
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
      toast.success('Message securely transmitted to agent.')
    } catch (err) {
      toast.error('Transmission failed. Retry.')
    } finally {
      setSendingReply(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title={t('officerDashboard.appTitle')} subtitle={t('officerDashboard.appSubtitle')}>
        <div className="flex-1 p-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      </AppLayout>
    )
  }

  const kpis = dashboard?.kpis || {}
  const topCase = selectedCase || incidents[0] || null

  return (
    <AppLayout title={t('officerDashboard.appTitle')} subtitle={t('officerDashboard.appSubtitle')}>
      <div className="flex-1 p-lg overflow-y-auto space-y-lg pb-xl">
        
        {/* Station Jurisdiction Badge */}
        <div className="flex flex-wrap items-center justify-between gap-md p-4 rounded-xl bg-surface-container border border-primary/20 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                {user?.is_cyber_specialized || user?.department?.toLowerCase().includes('cyber') ? 'cell_tower' : 'local_police'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">
                  {user?.parent_station_name || 'Ahmedabad Police Station / Cyber Unit'}
                </h2>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded border ${
                  user?.is_cyber_specialized || user?.department?.toLowerCase().includes('cyber')
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}>
                  {user?.is_cyber_specialized || user?.department?.toLowerCase().includes('cyber') ? '🌐 CYBER CRIME CELL' : '🚓 POLICE STATION JURISDICTION'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 font-mono-data">
                District: {user?.district || 'Ahmedabad'} | Unit: {user?.unit || user?.department || 'General Police'} | Active Cases: <span className="text-primary font-bold">{incidents.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-md">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase hover:brightness-110 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">assessment</span> {t('officerDashboard.generateReports', 'Generate Reports')}
          </button>
          <Link to="/officer/anonymous-tips" className="flex items-center gap-sm px-lg py-sm bg-error/10 text-error border border-error/30 font-bold text-xs tracking-widest uppercase hover:bg-error/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <span className="material-symbols-outlined text-lg">lock</span> Secure Tips
          </Link>
          <Link to="/officer/alerts" className="flex items-center gap-sm px-lg py-sm border border-secondary text-secondary font-bold text-xs tracking-widest uppercase hover:bg-secondary/10">
            <span className="material-symbols-outlined text-lg">add_alert</span> {t('officerDashboard.createAlert')}
          </Link>
          <Link to="/supervisor/patrol" className="flex items-center gap-sm px-lg py-sm border border-secondary text-secondary font-bold text-xs tracking-widest uppercase hover:bg-secondary/10">
            <span className="material-symbols-outlined text-lg">groups</span> {t('officerDashboard.assignPatrol')}
          </Link>
          <Link to="/supervisor/prediction" className="flex items-center gap-sm px-lg py-sm bg-surface-container-highest text-primary border border-primary/20 font-bold text-xs tracking-widest uppercase hover:bg-primary/10">
            <span className="material-symbols-outlined text-lg">auto_graph</span> {t('officerDashboard.predictCrime')}
          </Link>
        </div>

        {/* AI Case Summary & Operational Ahmedabad Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* AI Case Summary Card */}
          <div className="glass-panel p-md rounded-xl border border-primary/20 space-y-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="font-bold text-sm text-primary tracking-wide">{t('officerDashboard.aiCaseSummary', 'AI CASE SUMMARY')}</h3>
              </div>
              {topCase && (
                <span className="text-xs font-mono text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                  {topCase.complaint_id}
                </span>
              )}
            </div>

            {topCase ? (
              <div className="space-y-sm text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-900/60 border border-white/5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">{t('officerDashboard.crimeType', 'CRIME TYPE')}</span>
                    <span className="font-bold text-white text-sm">{topCase.category || 'UPI Fraud'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">{t('officerDashboard.severity', 'SEVERITY')}</span>
                    <span className={`font-bold text-sm ${(topCase.urgency_score || 0) >= 0.7 ? 'text-red-400' : 'text-amber-400'}`}>
                      {(topCase.urgency_score || 0) >= 0.7 ? 'CRITICAL' : 'HIGH'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-900/60 border border-white/5">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">{t('officerDashboard.urgencyScore', 'URGENCY SCORE')}</span>
                    <span className="font-bold text-emerald-400">{((topCase.urgency_score || 0.8) * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">{t('officerDashboard.goldenHour', 'GOLDEN HOUR')}</span>
                    <span className={`font-bold ${(topCase.urgency_score || 0) >= 0.7 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                      {(topCase.urgency_score || 0) >= 0.7 ? t('officerDashboard.active', '🔴 ACTIVE') : 'STANDARD'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">{t('officerDashboard.locationStation', 'LOCATION & STATION')}</span>
                  <span className="text-white block font-semibold">{topCase.locality || topCase.location || 'Ahmedabad West'}</span>
                  <span className="text-blue-400 block text-[11px]">Station: {topCase.station_name || 'Mithakhali Cyber Crime PS'}</span>
                </div>

                {topCase.assignment_explanation && (
                  <div className="p-2 rounded bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200">
                    <span className="font-bold text-blue-400 block mb-1">{t('officerDashboard.assignmentExplanation', 'Assignment Explanation:')}</span>
                    <pre className="whitespace-pre-wrap font-mono text-[10px] text-slate-300">{topCase.assignment_explanation}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs text-center py-6">Select a complaint to inspect AI summary.</p>
            )}
          </div>

          {/* Operational Ahmedabad Map */}
          <div className="lg:col-span-2 space-y-sm">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
              <span className="w-1 h-4 bg-secondary" /> {t('officerDashboard.operationalGrid', 'Operational Grid (Ahmedabad Jurisdiction)')}
            </h3>
            <InteractiveIntelligenceMap
              height="340px"
              stations={stations}
              incidents={incidents}
              showHeatmap={true}
              onSelectIncident={(inc) => setSelectedCase(inc)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
          <KpiCard label={t('officerDashboard.kpi.todayCrimes.label')} value={kpis.today_crimes || 0} icon="local_police" accent="secondary" trend={t('officerDashboard.kpi.todayCrimes.trend')} />
          <KpiCard label={t('officerDashboard.kpi.highRiskAreas.label')} value={kpis.high_risk_areas || 0} icon="dangerous" accent="error" subtext={t('officerDashboard.kpi.highRiskAreas.subtext')} />
          <KpiCard label={t('officerDashboard.kpi.emergencyAlerts.label')} value={kpis.emergency_alerts || 0} icon="notifications_active" accent="secondary" subtext={t('officerDashboard.kpi.emergencyAlerts.subtext')} />
          <KpiCard label={t('officerDashboard.kpi.patrolUnits.label')} value={kpis.patrol_units || 0} icon="radio" accent="secondary" subtext={t('officerDashboard.kpi.patrolUnits.subtext')} />
          <KpiCard label={t('officerDashboard.kpi.predictionAccuracy.label')} value={`${kpis.prediction_accuracy || 0}%`} icon="analytics" accent="primary" subtext={t('officerDashboard.kpi.predictionAccuracy.subtext')} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-lg">
              <span className="w-1 h-4 bg-secondary" /> {t('officerDashboard.charts.crimeTrendMatrix')}
            </h3>
            <CrimeTrendChart />
          </div>
          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-lg">
              <span className="w-1 h-4 bg-primary" /> {t('officerDashboard.charts.incidentSegments')}
            </h3>
            <CategoryPieChart />
          </div>
        </div>

        {/* Encrypted Agent Transmissions section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm space-y-md">
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

          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm flex flex-col justify-between">
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
        <TableSection title={t('officerDashboard.table.title')} badge={t('officerDashboard.table.badge')}>
          {incidents.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant font-mono-data border border-dashed border-primary/20 rounded-xl">
              No recent incidents assigned to you.
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'complaint_id', label: t('officerDashboard.table.columns.id'), render: (r) => <Link to={`/officer/complaints/${r.id}`} className="font-mono-data text-secondary hover:underline">{r.complaint_id}</Link> },
                { key: 'category', label: t('officerDashboard.table.columns.type') },
                { key: 'location', label: t('officerDashboard.table.columns.location') },
                { key: 'status', label: t('officerDashboard.table.columns.status'), render: (r) => (
                  <span className="flex items-center gap-xs text-[10px] font-bold text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> {r.status?.toUpperCase()}
                  </span>
                )},
                { key: 'urgency_score', label: t('officerDashboard.table.columns.severity'), render: (r) => (
                  <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: `${r.urgency_score * 100}%` }} />
                  </div>
                )},
              ]}
              data={incidents}
            />
          )}
        </TableSection>
      </div>

      {/* Report Generator Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-high border border-primary/30 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-md border-b border-white/10 flex justify-between items-center bg-surface-container-highest">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">assessment</span>
                <div>
                  <h3 className="font-bold text-on-surface text-base">{t('officerDashboard.reportModalTitle', 'Officer Intelligence Report Generator')}</h3>
                  <p className="text-xs text-secondary font-mono">AHMEDABAD POLICE COMMAND GRID</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-lg overflow-y-auto space-y-md font-mono text-xs text-on-surface">
              <div className="border border-primary/20 bg-slate-950 p-md rounded-lg space-y-sm">
                <div className="flex justify-between border-b border-primary/20 pb-sm">
                  <span className="font-bold text-primary text-sm">SMARTPOL AI — OFFICIAL INCIDENT SUMMARY</span>
                  <span className="text-secondary font-mono">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-md py-sm border-b border-white/10 text-slate-300">
                  <div><span className="text-slate-400 block text-[10px]">REPORTING OFFICER</span>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username} (Badge: {user?.badge_id || 'OFF-882'})</div>
                  <div><span className="text-slate-400 block text-[10px]">JURISDICTION</span>Ahmedabad Crime Branch Cell</div>
                  <div><span className="text-slate-400 block text-[10px]">TOTAL ASSIGNED CASES</span>{incidents.length}</div>
                  <div><span className="text-slate-400 block text-[10px]">HIGH RISK GOLDEN HOUR</span>{incidents.filter(i => (i.urgency_score || 0) >= 0.7).length} Cases</div>
                </div>

                {topCase && (
                  <div className="space-y-sm pt-sm">
                    <span className="font-bold text-secondary text-xs uppercase block">Primary Active Focus Case: {topCase.complaint_id}</span>
                    <div className="bg-slate-900 p-sm rounded border border-white/5 space-y-1">
                      <p><span className="text-slate-400">Title:</span> {topCase.title}</p>
                      <p><span className="text-slate-400">Category:</span> {topCase.category}</p>
                      <p><span className="text-slate-400">Location:</span> {topCase.locality || topCase.location}</p>
                      <p><span className="text-slate-400">Status:</span> {topCase.status?.toUpperCase()}</p>
                      <p><span className="text-slate-400">Urgency:</span> {((topCase.urgency_score || 0) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-md pt-sm">
                <button
                  onClick={() => {
                    toast.success('Official PDF Report compiled & generated.')
                    window.print()
                  }}
                  className="px-lg py-sm bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  {t('officerDashboard.downloadReport', 'Download PDF Report')}
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-lg py-sm border border-outline-variant text-on-surface font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
