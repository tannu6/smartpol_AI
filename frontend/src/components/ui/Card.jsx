import { cn } from '../../utils/cn'

const ACCENT = {
  error:     { border: 'border-l-error',     text: 'text-error',     bg: 'bg-error' },
  secondary: { border: 'border-l-secondary', text: 'text-secondary', bg: 'bg-secondary' },
  primary:   { border: 'border-l-primary',   text: 'text-primary',   bg: 'bg-primary' },
  tertiary:  { border: 'border-l-tertiary',  text: 'text-tertiary',  bg: 'bg-tertiary' },
}

export function Card({ children, className, accent }) {
  const a = ACCENT[accent]
  return (
    <div className={cn('glass-panel relative rounded-xl p-md', a?.border, className)}>
      {children}
    </div>
  )
}

export function KpiCard({ label, value, icon, accent = 'secondary', trend, subtext }) {
  const accentColors = { secondary: 'bg-secondary', error: 'bg-error', primary: 'bg-primary', tertiary: 'bg-tertiary' }
  const iconColors = { secondary: 'text-secondary', error: 'text-error', primary: 'text-primary', tertiary: 'text-tertiary' }
  return (
    <div className="bg-surface-container-low/60 backdrop-blur-xl border border-primary/15 p-md relative overflow-hidden group">
      <div className={cn('absolute top-0 left-0 w-1 h-full', accentColors[accent] || accentColors.secondary)} />
      <div className="flex justify-between items-start mb-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-tighter">{label}</span>
        <span className={cn('material-symbols-outlined', iconColors[accent] || iconColors.secondary)}>{icon}</span>
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
  const a = ACCENT[color] || ACCENT.error
  return (
    <div className={cn('glass-panel p-md rounded-xl border-l-4 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer', a.border)}>
      <div className="flex justify-between items-start mb-md relative z-10">
        <span className={cn('material-symbols-outlined', a.text)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        {priority && <span className={cn('font-mono-data text-xs', a.text)}>{priority}</span>}
      </div>
      <h3 className="font-bold text-headline-md mb-xs text-on-surface">{title}</h3>
      <div className="flex items-end gap-md">
        <p className={cn('text-display-lg leading-none font-bold', a.text)}>{value}</p>
        {description && <p className="text-on-surface-variant text-body-sm pb-1">{description}</p>}
      </div>
      {progress !== undefined && (
        <div className="mt-md w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
          <div className={cn('h-full', a.bg)} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

export function GlassPanel({ children, className }) {
  return <div className={cn('glass-panel relative rounded-xl', className)}>{children}</div>
}