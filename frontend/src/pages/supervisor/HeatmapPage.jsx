import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import CrimeHeatmap from '../../components/charts/CrimeHeatmap'
import { analyticsService } from '../../services/api'

export default function HeatmapPage() {
  const [points, setPoints] = useState([])

  useEffect(() => {
    analyticsService.get().then(({ data }) => setPoints(data.heatmap_points || [])).catch(() => {})
  }, [])

  return (
    <AppLayout title="SmartPol AI" subtitle="Tactical Heatmap">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">Crime Heatmap</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="Hot Zones" value={points.filter(p => p.intensity > 0.7).length} icon="local_fire_department" accent="error" />
          <KpiCard label="Data Points" value={points.length} icon="pin_drop" accent="secondary" />
          <KpiCard label="Coverage" value="Sector 7G" icon="map" accent="primary" />
          <KpiCard label="Refresh" value="LIVE" icon="sync" accent="secondary" />
        </div>
        <div className="glass-panel p-md rounded-xl">
          <h3 className="font-title-sm text-secondary mb-md">Tactical Crime Density</h3>
          <CrimeHeatmap points={points} />
        </div>
      </div>
    </AppLayout>
  )
}
