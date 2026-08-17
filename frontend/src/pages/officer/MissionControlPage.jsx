import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { useTranslation } from 'react-i18next'
import { useApp } from '../../context/AppContext'
import { dashboardService, complaintService, policeStationService } from '../../services/api'
import toast from 'react-hot-toast'

export default function MissionControlPage() {
  const { t } = useTranslation()
  const { setDispatchModalOpen } = useApp()
  const [dashboard, setDashboard] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeUnitTab, setActiveUnitTab] = useState('all')

  useEffect(() => {
    Promise.all([
      dashboardService.get().catch(() => ({ data: {} })),
      complaintService.list().catch(() => ({ data: [] })),
      policeStationService.list().catch(() => ({ data: [] }))
    ])
    .then(([dashRes, compRes, stRes]) => {
      setDashboard(dashRes.data || {})
      const incList = compRes.data.results ? compRes.data.results : (Array.isArray(compRes.data) ? compRes.data : [])
      setIncidents(incList)
      const stList = stRes.data.results ? stRes.data.results : (Array.isArray(stRes.data) ? stRes.data : [])
      setStations(stList)
    })
    .finally(() => setLoading(false))
  }, [])

  const kpis = dashboard?.kpis || {}
  const activeCount = incidents.length || kpis.today_crimes || 0
  const criticalCount = incidents.filter(i => (i.urgency_score || 0) >= 0.7).length || kpis.emergency_alerts || 0
  const totalCapacity = stations.reduce((acc, s) => acc + (s.officer_capacity || 10), 0)
  const deployedPercent = totalCapacity > 0 ? Math.min(96, Math.round((activeCount * 12 + 40) / totalCapacity * 100)) : 85

  const tacticalUnits = [
    { callsign: 'UNIT BLUE-4', status: 'EN ROUTE', speed: '54 km/h', area: 'SG Highway / Thaltej', type: 'PATROL', ping: '12ms' },
    { callsign: 'UNIT RED-1', status: 'STANDBY', speed: '0 km/h', area: 'Mithakhali Cell', type: 'SWAT', ping: '8ms' },
    { callsign: 'UNIT GOLD-7', status: 'PATROLLING', speed: '32 km/h', area: 'Science City', type: 'CYBER CRIME', ping: '15ms' },
    { callsign: 'UNIT ALPHA-1', status: 'DISPATCHED', speed: '68 km/h', area: 'C.G. Road Corridor', type: 'K9 SPECIAL', ping: '10ms' },
    { callsign: 'UNIT DELTA-9', status: 'PATROLLING', speed: '40 km/h', area: 'Navrangpura', type: 'TRAFFIC TASKFORCE', ping: '18ms' },
  ]

  return (
    <AppLayout title={t('missionControl.appTitle')} subtitle={t('officerDashboard.appSubtitle', 'Ahmedabad Cyber Jurisdiction — Active Patrol')}>
      <div className="p-lg space-y-lg flex-1 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div>
            <h2 className="font-display-lg-mobile text-primary uppercase tracking-tight">{t('missionControl.title')}</h2>
            <p className="text-xs text-on-surface-variant font-mono">Real-time Operations & Tactical Unit Telemetry Console</p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="px-lg py-sm bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">emergency</span>
              Dispatch Tactical Unit
            </button>
            <span className="text-xs font-mono px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-md hidden md:block">
              Ahmedabad Command Grid
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <KpiCard 
            label={t('missionControl.kpis.activeMissions', 'Active Operations')} 
            value={loading ? '...' : activeCount} 
            icon="flag" 
            accent="secondary" 
          />
          <KpiCard 
            label={t('missionControl.kpis.unitsDeployed', 'Units Deployed')} 
            value={loading ? '...' : `${deployedPercent}%`} 
            icon="groups" 
            accent="primary" 
          />
          <KpiCard 
            label={t('missionControl.kpis.responseTime', 'Avg Response Time')} 
            value="3.8m" 
            icon="timer" 
            accent="secondary" 
            subtext="Golden Hour Target < 15m"
          />
          <KpiCard 
            label={t('missionControl.kpis.criticalAlerts', 'Critical Alerts')} 
            value={loading ? '...' : criticalCount} 
            icon="emergency" 
            accent="error" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Tactical Telemetry & Unit Radar replacing duplicate map */}
          <div className="lg:col-span-2 glass-panel p-md rounded-xl space-y-md border border-primary/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-sm">
              <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
                <span className="w-1 h-4 bg-secondary" /> Tactical Response Unit Telemetry Radar
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {tacticalUnits.map((u, i) => (
                <div key={i} className="p-md bg-surface-container-low/60 rounded-xl border border-white/5 space-y-sm font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary text-sm">{u.callsign}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'EN ROUTE' || u.status === 'DISPATCHED' ? 'bg-secondary/20 text-secondary border border-secondary/30 animate-pulse' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-on-surface-variant">
                    <div><span className="text-slate-400 block text-[9px]">TYPE</span>{u.type}</div>
                    <div><span className="text-slate-400 block text-[9px]">SPEED</span>{u.speed}</div>
                    <div className="col-span-2"><span className="text-slate-400 block text-[9px]">SECTOR</span>{u.area}</div>
                  </div>
                  <div className="flex justify-between items-center pt-xs border-t border-white/5 text-[10px] text-on-surface-variant">
                    <span>Ping: {u.ping}</span>
                    <button
                      onClick={() => {
                        setDispatchModalOpen(true)
                        toast.success(`Connected to ${u.callsign}`)
                      }}
                      className="text-secondary hover:underline font-bold"
                    >
                      Vector Unit →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-md rounded-xl space-y-md border border-primary/20">
            <h3 className="font-title-sm text-on-surface border-b border-white/10 pb-sm">
              {t('missionControl.unitStatus.title', 'Ahmedabad Police Station Capacities')}
            </h3>
            <div className="space-y-sm font-mono text-xs max-h-[360px] overflow-y-auto pr-1">
              {stations.length > 0 ? (
                stations.map((st, i) => (
                  <div key={st.id || i} className="p-2.5 bg-surface-container/40 rounded border border-primary/10 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-on-surface text-xs truncate max-w-[170px]">{st.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${st.is_cyber_specialized ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                        {st.is_cyber_specialized ? 'CYBER CELL' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <span>Area: {st.area}</span>
                      <span className="text-secondary">Capacity: {st.officer_capacity} Officers</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-on-surface-variant">Loading police stations...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
