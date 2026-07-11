import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import CrimeHeatmap from '../../components/charts/CrimeHeatmap'

export default function WarRoomPage() {
  return (
    <AppLayout title="SmartPol AI" subtitle="Strategic Command War Room">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">Strategic Command War Room</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="Threat Level" value="HIGH" icon="warning" accent="error" />
          <KpiCard label="Active Ops" value="7" icon="hub" accent="secondary" />
          <KpiCard label="Intel Feeds" value="23" icon="satellite_alt" accent="primary" />
          <KpiCard label="Units Ready" value="94%" icon="military_tech" accent="secondary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-secondary mb-md">Tactical Overview</h3>
            <CrimeHeatmap />
          </div>
          <div className="glass-panel p-md rounded-xl space-y-md">
            <h3 className="font-title-sm text-error">Real-time Alerts</h3>
            {['Gunfire detected — Sector 3', 'Encryption breach — Level 3', 'Crowd formation — Plaza Square'].map((a, i) => (
              <div key={i} className="p-sm bg-error/5 border border-error/20 rounded-lg text-sm">
                <span className="w-2 h-2 rounded-full bg-error inline-block mr-sm animate-pulse" />
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
