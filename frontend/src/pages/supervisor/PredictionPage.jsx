import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DailyTrendChart } from '../../components/charts/Charts'
import { analyticsService } from '../../services/api'

const PREDICTIONS = [
  { zone: 'Cyber Park Dr.', risk: 92, type: 'Cyber Fraud', window: 'Next 6h' },
  { zone: 'Metro Station B', risk: 78, type: 'Theft', window: 'Next 12h' },
  { zone: 'District 2 Vault', risk: 65, type: 'Scam Cluster', window: 'Next 24h' },
  { zone: 'Outer Rim Apts.', risk: 45, type: 'Harassment', window: 'Next 48h' },
]

export default function PredictionPage() {
  const [trends, setTrends] = useState([])

  useEffect(() => {
    analyticsService.get().then(({ data }) => setTrends(data.daily_trends || [])).catch(() => {})
  }, [])

  return (
    <AppLayout title="SmartPol AI" subtitle="Crime Prediction">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">AI Crime Prediction</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="Model Accuracy" value="94.8%" icon="analytics" accent="primary" />
          <KpiCard label="High Risk Zones" value={PREDICTIONS.filter(p => p.risk > 70).length} icon="warning" accent="error" />
          <KpiCard label="Predictions" value={PREDICTIONS.length} icon="auto_graph" accent="secondary" />
          <KpiCard label="Horizon" value="48h" icon="schedule" accent="primary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-lg">Historical Baseline</h3>
            <DailyTrendChart data={trends} />
          </div>
          <div className="glass-panel p-lg rounded-xl space-y-md">
            <h3 className="font-title-sm text-error mb-md">Predicted Incidents</h3>
            {PREDICTIONS.map((p, i) => (
              <div key={i} className="p-md bg-surface-container-low/50 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center mb-sm">
                  <span className="font-bold text-on-surface">{p.zone}</span>
                  <span className="font-mono-data text-error">{p.risk}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-sm">
                  <div className="h-full bg-error" style={{ width: `${p.risk}%` }} />
                </div>
                <p className="text-xs text-on-surface-variant">{p.type} — {p.window}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
