import { cn } from '../../utils/cn'

export function CyberInput({ label, icon, type = 'text', register, error, placeholder, className, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">{icon}</span>
        )}
        <input
          type={type}
          className={cn('cyber-input w-full pl-xl pr-md py-md rounded-lg text-white font-body-md placeholder:text-outline/50', icon && 'pl-xl')}
          placeholder={placeholder}
          {...(register || {})}
          {...props}
        />
      </div>
      {error && <p className="text-error text-xs">{error.message || error}</p>}
    </div>
  )
}

export function CyberButton({ children, variant = 'primary', className, loading, ...props }) {
  const variants = {
    primary: 'neo-button w-full bg-primary-container text-white py-md rounded-lg font-title-sm flex items-center justify-center gap-sm uppercase tracking-wider',
    secondary: 'w-full bg-surface-container-highest/50 hover:bg-surface-container-highest border border-outline/20 text-on-surface py-md rounded-lg font-body-md flex items-center justify-center gap-sm transition-all',
    danger: 'bg-error text-white font-bold text-xs px-md py-2 rounded-lg hover:brightness-110',
    outline: 'flex items-center gap-sm px-lg py-sm border border-secondary text-secondary font-bold text-xs tracking-widest uppercase hover:bg-secondary/10 transition-all',
  }
  return (
    <button className={cn(variants[variant], className)} disabled={loading} {...props}>
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-2">Processing...</span>
        </>
      ) : children}
    </button>
  )
}

export function CyberSelect({ label, options, register, error, className, value, onChange, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</label>}
      <select
        className="cyber-input w-full px-md py-md rounded-lg text-white font-body-md"
        value={value}
        onChange={onChange}
        {...(register || {})}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-error text-xs">{error.message}</p>}
    </div>
  )
}

export function CyberTextarea({ label, register, error, placeholder, rows = 4, className, value, onChange, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</label>}
      <textarea
        className="cyber-input w-full px-md py-md rounded-lg text-white font-body-md placeholder:text-outline/50 resize-none"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...(register || {})}
        {...props}
      />
      {error && <p className="text-error text-xs">{error.message}</p>}
    </div>
  )
}
