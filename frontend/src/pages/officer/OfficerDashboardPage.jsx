import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { CrimeTrendChart, CategoryPieChart } from '../../components/charts/Charts'
import { DataTable, TableSection } from '../../components/ui/DataTable'
import { dashboardService, complaintService } from '../../services/api'

export default function OfficerDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    dashboardService.get().then(({ data }) => setDashboard(data))
    complaintService.list().then(({ data }) => setIncidents(Array.isArray(data) ? data.slice(0, 5) : []))
  }, [])

  const kpis = dashboard?.kpis || {}

  return (
    <AppLayout title="SmartPol AI" subtitle="Sector 7G — High Alert">
      <div className="flex-1 p-lg overflow-y-auto space-y-lg pb-xl">
        <div className="flex flex-wrap items-center gap-md">
          <button className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary font-bold text-xs tracking-widest uppercase hover:brightness-110 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <span className="material-symbols-outlined text-lg">assessment</span> Generate Reports
          </button>
          <Link to="/officer/alerts" className="flex items-center gap-sm px-lg py-sm border border-secondary text-secondary font-bold text-xs tracking-widest uppercase hover:bg-secondary/10">
            <span className="material-symbols-outlined text-lg">add_alert</span> Create Alert
          </Link>
          <Link to="/supervisor/patrol" className="flex items-center gap-sm px-lg py-sm border border-secondary text-secondary font-bold text-xs tracking-widest uppercase hover:bg-secondary/10">
            <span className="material-symbols-outlined text-lg">groups</span> Assign Patrol
          </Link>
          <Link to="/supervisor/prediction" className="flex items-center gap-sm px-lg py-sm bg-surface-container-highest text-primary border border-primary/20 font-bold text-xs tracking-widest uppercase hover:bg-primary/10">
            <span className="material-symbols-outlined text-lg">auto_graph</span> Predict Crime
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-md">
          <KpiCard label="Today's Crimes" value={kpis.today_crimes || 42} icon="local_police" accent="secondary" trend="+12% vs Yesterday" />
          <KpiCard label="High Risk Areas" value={kpis.high_risk_areas || 8} icon="dangerous" accent="error" subtext="Active Monitoring" />
          <KpiCard label="Emergency Alerts" value={kpis.emergency_alerts || 3} icon="notifications_active" accent="secondary" subtext="PENDING DISPATCH" />
          <KpiCard label="Patrolling Units" value={kpis.patrol_units || 114} icon="radio" accent="secondary" subtext="82% DEPLOYED" />
          <KpiCard label="Prediction Accuracy" value={`${kpis.prediction_accuracy || 94.8}%`} icon="analytics" accent="primary" subtext="Optimized" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-lg">
              <span className="w-1 h-4 bg-secondary" /> Crime Trend Matrix
            </h3>
            <CrimeTrendChart />
          </div>
          <div className="bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 p-lg rounded-sm">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-lg">
              <span className="w-1 h-4 bg-primary" /> Incident Segments
            </h3>
            <CategoryPieChart />
          </div>
        </div>
        <TableSection title="Active Field Incidents" badge="LIVE_FEED">
          <DataTable
            columns={[
              { key: 'complaint_id', label: 'ID', render: (r) => <span className="font-mono-data text-secondary">{r.complaint_id}</span> },
              { key: 'category', label: 'Type' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status', render: (r) => (
                <span className="flex items-center gap-xs text-[10px] font-bold text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> {r.status?.toUpperCase()}
                </span>
              )},
              { key: 'urgency_score', label: 'Severity', render: (r) => (
                <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${r.urgency_score * 100}%` }} />
                </div>
              )},
            ]}
            data={incidents}
          />
        </TableSection>
      </div>
    </AppLayout>
  )
}
