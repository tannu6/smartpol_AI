import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { CrimeTrendChart, CategoryPieChart } from '../../components/charts/Charts'
import { DataTable, TableSection } from '../../components/ui/DataTable'
import { dashboardService, complaintService, secretAgentService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function OfficerDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [agentMessages, setAgentMessages] = useState([])
  const [replyBody, setReplyBody] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadAgentMessages = () => {
    secretAgentService.inbox()
      .then(({ data }) => setAgentMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      dashboardService.get(),
      complaintService.list()
    ])
    .then(([dashRes, compRes]) => {
      setDashboard(dashRes.data)
      setIncidents(Array.isArray(compRes.data) ? compRes.data.slice(0, 5) : [])
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
      alert('Message securely transmitted to agent.')
    } catch (err) {
      alert('Transmission failed. Retry.')
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

  return (
    <AppLayout title={t('officerDashboard.appTitle')} subtitle={t('officerDashboard.appSubtitle')}>
      <div className="flex-1 p-lg overflow-y-auto space-y-lg pb-xl">
        <div className="flex flex-wrap items-center gap-md">
          <button className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase hover:brightness-110 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <span className="material-symbols-outlined text-lg">assessment</span> {t('officerDashboard.generateReports')}
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
    </AppLayout>
  )
}
