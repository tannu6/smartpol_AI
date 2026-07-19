import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { CrimeTrendChart, CategoryPieChart } from '../../components/charts/Charts'
import { DataTable, TableSection } from '../../components/ui/DataTable'
import { dashboardService, complaintService } from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function OfficerDashboardPage() {
  const { t } = useTranslation()
  const [dashboard, setDashboard] = useState(null)
  const [incidents, setIncidents] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.get(),
      complaintService.list()
    ])
    .then(([dashRes, compRes]) => {
      setDashboard(dashRes.data)
      setIncidents(Array.isArray(compRes.data) ? compRes.data.slice(0, 5) : [])
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [])

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
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
