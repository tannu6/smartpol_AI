import { cn } from '../../utils/cn'

export function CyberInput({ label, icon, type = 'text', register, error, placeholder, className, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && (
        <label className="block font-label-caps text-on-surface-variant uppercase tracking-widest" style={{ fontSize: 11, fontWeight: 700 }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined absolute text-outline"
            style={{ left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, pointerEvents: 'none' }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          className="cyber-input w-full rounded-lg text-white font-body-md"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: icon ? 44 : 14,
            paddingRight: 14,
          }}
          placeholder={placeholder}
          {...(register || {})}
          {...props}
        />
      </div>
      {error && <p className="text-error text-xs mt-1">{error.message || error}</p>}
    </div>
  )
}

export function CyberButton({ children, variant = 'primary', className, loading, type = 'button', ...props }) {
  const base = 'w-full flex items-center justify-center gap-sm font-title-sm uppercase tracking-wider transition-all rounded-lg disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'neo-button bg-primary-container text-white',
    secondary: 'bg-surface-container-highest border border-outline/20 text-on-surface hover:bg-surface-container',
    danger: 'bg-error-container text-white hover:brightness-110',
    outline: 'border border-secondary text-secondary hover:bg-secondary/10',
  }
  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      style={{ paddingTop: 13, paddingBottom: 13 }}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  )
}

export function CyberSelect({ label, options = [], register, error, className, value, onChange, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && (
        <label className="block font-label-caps text-on-surface-variant uppercase tracking-widest" style={{ fontSize: 11, fontWeight: 700 }}>
          {label}
        </label>
      )}
      <select
        className="cyber-input w-full rounded-lg text-white font-body-md"
        style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 14, paddingRight: 14 }}
        value={value}
        onChange={onChange}
        {...(register || {})}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#091327', color: '#fff' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-error text-xs mt-1">{error.message}</p>}
    </div>
  )
}

export function CyberTextarea({ label, register, error, placeholder, rows = 4, className, value, onChange, ...props }) {
  return (
    <div className={cn('space-y-sm', className)}>
      {label && (
        <label className="block font-label-caps text-on-surface-variant uppercase tracking-widest" style={{ fontSize: 11, fontWeight: 700 }}>
          {label}
        </label>
      )}
      <textarea
        className="cyber-input w-full rounded-lg text-white font-body-md resize-none"
        style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 14, paddingRight: 14 }}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...(register || {})}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error.message}</p>}
    </div>
  )
}
