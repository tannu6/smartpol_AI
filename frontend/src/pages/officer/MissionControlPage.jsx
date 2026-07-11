import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'

export default function MissionControlPage() {
  return (
    <AppLayout title="SmartPol AI" subtitle="Mission Control">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">Mission Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <KpiCard label="Active Missions" value="12" icon="flag" accent="secondary" />
          <KpiCard label="Units Deployed" value="82%" icon="groups" accent="primary" />
          <KpiCard label="Response Time" value="4.2m" icon="timer" accent="secondary" />
          <KpiCard label="Critical Alerts" value="3" icon="emergency" accent="error" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-md flex items-center gap-sm"><span className="w-1 h-4 bg-secondary" /> Live Unit Map</h3>
            <div className="h-64 bg-surface-container-lowest/50 rounded-lg flex items-center justify-center border border-primary/10">
              <span className="font-mono-data text-on-surface-variant">Tactical map overlay — Sector 7G</span>
            </div>
          </div>
          <div className="glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-md">Unit Status</h3>
            <div className="space-y-md">
              {['Blue-4 — Patrolling', 'Red-1 — Responding', 'Gold-7 — In Briefing'].map((u, i) => (
                <div key={i} className="flex justify-between p-sm bg-surface-container/30 rounded-sm text-sm">
                  <span>{u.split(' — ')[0]}</span>
                  <span className="text-secondary text-xs font-bold">{u.split(' — ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
