import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'

const UNITS = [
  { id: 'P-101', officer: 'Officer Singh', zone: 'Sector 3', status: 'patrolling', efficiency: 94 },
  { id: 'P-102', officer: 'Officer Patel', zone: 'Cyber Park', status: 'responding', efficiency: 88 },
  { id: 'P-103', officer: 'Officer Kumar', zone: 'District 2', status: 'available', efficiency: 91 },
  { id: 'P-104', officer: 'Officer Sharma', zone: 'Metro B', status: 'patrolling', efficiency: 86 },
]

export default function PatrolPage() {
  return (
    <AppLayout title="SmartPol AI" subtitle="Patrol Optimization">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">Patrol Optimization</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="Units Deployed" value="82%" icon="directions_car" accent="secondary" />
          <KpiCard label="Active Patrols" value={UNITS.filter(u => u.status === 'patrolling').length} icon="local_police" accent="primary" />
          <KpiCard label="Avg Response" value="4.2m" icon="timer" accent="secondary" />
          <KpiCard label="Coverage" value="94%" icon="radar" accent="primary" />
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-secondary">PATROL UNITS</h3></div>
          <div className="divide-y divide-primary/5">
            {UNITS.map(unit => (
              <div key={unit.id} className="px-lg py-md flex flex-wrap justify-between items-center gap-md hover:bg-primary/5">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <div>
                    <p className="font-bold text-on-surface">{unit.officer}</p>
                    <p className="font-mono-data text-xs text-on-surface-variant">{unit.id} — {unit.zone}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${unit.status === 'responding' ? 'text-error bg-error/10' : unit.status === 'patrolling' ? 'text-secondary bg-secondary/10' : 'text-primary bg-primary/10'}`}>
                  {unit.status}
                </span>
                <span className="font-mono-data text-sm text-on-surface-variant">Eff: {unit.efficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
