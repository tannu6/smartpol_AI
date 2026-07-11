import { cn } from '../../utils/cn'

export function Card({ children, className, accent }) {
  return (
    <div className={cn('glass-panel relative rounded-xl p-md', accent && `border-l-4 border-l-${accent}`, className)}>
      {children}
    </div>
  )
}

export function KpiCard({ label, value, icon, accent = 'secondary', trend, subtext }) {
  const accentColors = { secondary: 'bg-secondary', error: 'bg-error', primary: 'bg-primary' }
  const iconColors = { secondary: 'text-secondary', error: 'text-error', primary: 'text-primary' }
  return (
    <div className="bg-surface-container-low/60 backdrop-blur-xl border border-primary/15 p-md relative overflow-hidden group">
      <div className={cn('absolute top-0 left-0 w-1 h-full', accentColors[accent] || accentColors.secondary)} />
      <div className="flex justify-between items-start mb-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-tighter">{label}</span>
        <span className={cn('material-symbols-outlined', iconColors[accent])}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-on-surface mb-xs">{value}</div>
      {trend && (
        <div className="flex items-center text-[10px] text-error font-bold">
          <span className="material-symbols-outlined text-xs">trending_up</span> {trend}
        </div>
      )}
      {subtext && <div className="text-[10px] text-on-surface-variant font-mono-data uppercase">{subtext}</div>}
    </div>
  )
}

export function StatCard({ title, value, icon, priority, color = 'error', description, progress }) {
  return (
    <div className={`glass-panel p-md rounded-xl border-l-4 border-l-${color} relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer`}>
      <div className="flex justify-between items-start mb-md relative z-10">
        <span className={`material-symbols-outlined text-${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        {priority && <span className={`text-${color} font-mono-data text-xs`}>{priority}</span>}
      </div>
      <h3 className="font-bold text-headline-md mb-xs text-on-surface">{title}</h3>
      <div className="flex items-end gap-md">
        <p className={`text-display-lg text-${color} leading-none font-bold`}>{value}</p>
        {description && <p className="text-on-surface-variant text-body-sm pb-1">{description}</p>}
      </div>
      {progress !== undefined && (
        <div className="mt-md w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
          <div className={`bg-${color} h-full`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

export function GlassPanel({ children, className }) {
  return <div className={cn('glass-panel relative rounded-xl', className)}>{children}</div>
}
