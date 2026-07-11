import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DailyTrendChart, OfficerPerformanceChart, CategoryPieChart } from '../../components/charts/Charts'
import { analyticsService } from '../../services/api'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    analyticsService.get().then(({ data: d }) => setData(d)).catch(() => {})
  }, [])

  const officerData = (data?.officer_performance || []).map(o => ({
    name: `${o.first_name} ${o.last_name?.[0]}.`,
    cases: o.cases,
  }))

  return (
    <AppLayout title="SMARTPOL AI" subtitle="Strategic Analytics">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg text-primary uppercase tracking-tighter">Strategic Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <KpiCard label="Total Cases" value={data?.daily_trends?.reduce((a, b) => a + b.crimes, 0) || 0} icon="analytics" accent="primary" />
          <KpiCard label="Avg Urgency" value={`${((data?.avg_urgency || 0) * 100).toFixed(0)}%`} icon="speed" accent="error" />
          <KpiCard label="Officers Active" value={data?.officer_performance?.length || 0} icon="badge" accent="secondary" />
          <KpiCard label="Scam Clusters" value={data?.categories?.length || 0} icon="biotech" accent="primary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-lg flex items-center gap-sm"><span className="w-1 h-4 bg-secondary" /> 7-Day Crime Trends</h3>
            <DailyTrendChart data={data?.daily_trends} />
          </div>
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-lg flex items-center gap-sm"><span className="w-1 h-4 bg-primary" /> Category Distribution</h3>
            <CategoryPieChart data={data?.categories?.map(c => ({ name: c.category, value: c.count }))} />
          </div>
        </div>
        <div className="glass-panel p-lg rounded-xl">
          <h3 className="font-title-sm text-on-surface mb-lg">Officer Performance</h3>
          <OfficerPerformanceChart data={officerData} />
        </div>
      </div>
    </AppLayout>
  )
}
