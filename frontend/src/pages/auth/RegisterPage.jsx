import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'
import { ROLE_LABELS, ROLES } from '../../config/navigation'

const INPUT_STYLE = {
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 44,
  paddingRight: 14,
  background: 'rgba(4,14,33,0.8)',
  border: '1px solid rgba(180,197,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const INPUT_NO_ICON_STYLE = {
  ...INPUT_STYLE,
  paddingLeft: 14,
}

function Field({ label, icon, type = 'text', register: reg, error, placeholder, showToggle, onToggle, showPass }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          style={{ ...(icon ? INPUT_STYLE : INPUT_NO_ICON_STYLE), paddingRight: showToggle ? 44 : 14, borderColor: error ? 'rgba(255,100,100,0.5)' : 'rgba(180,197,255,0.1)' }}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 1px #2563eb, 0 0 14px rgba(37,99,235,0.2)'; }}
          onBlur={e => { e.target.style.borderColor = error ? 'rgba(255,100,100,0.5)' : 'rgba(180,197,255,0.1)'; e.target.style.boxShadow = 'none'; }}
          {...reg}
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8d90a0', padding: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{error.message || error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser, getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: ROLES.CITIZEN },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      await registerUser(data)
      navigate(getDefaultRoute())
    } catch (err) {
      setApiError(err.response?.data?.detail || t('errors.generic'))
      setLoading(false)
    }
  }

  const roleOptions = Object.entries(ROLE_LABELS)
    .filter(([k]) => k !== ROLES.ADMIN && k !== ROLES.SECRET_AGENT)
    .map(([value, label]) => ({ value, label }))

  return (
    <main style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#040e21', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <LanguageSelector />
      </div>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(37,99,235,0.15)',
            border: '1.5px solid rgba(37,99,235,0.35)',
            marginBottom: 12,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>SmartPol AI</h1>
          <p style={{ fontSize: 12, color: '#4cd7f6', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '4px 0 0', fontFamily: "'Space Mono', monospace" }}>
            {t('auth.register.subtitle')}
          </p>
        </div>

        <div style={{
          background: 'rgba(16,26,46,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(180,197,255,0.12)',
          borderRadius: 16,
          padding: '32px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{t('auth.register.title')}</h2>
          <p style={{ fontSize: 13, color: '#8d90a0', margin: '0 0 24px' }}>{t('auth.register.description')}</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Field label={t('auth.register.username')} icon="person" placeholder={t('auth.register.usernamePlaceholder')}
              register={register('username', { required: t('forms.required'), minLength: { value: 3, message: t('forms.usernameTooShort') } })}
              error={errors.username} />

            <Field label={t('auth.register.email')} icon="mail" type="email" placeholder="operative@smartpol.gov"
              register={register('email', { required: t('forms.required'), pattern: { value: /\S+@\S+\.\S+/, message: t('forms.invalidEmail') } })}
              error={errors.email} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {t('auth.register.firstName')}
                </label>
                <input placeholder={t('auth.register.firstPlaceholder')} style={{ ...INPUT_NO_ICON_STYLE }} {...register('first_name')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {t('auth.register.lastName')}
                </label>
                <input placeholder={t('auth.register.lastPlaceholder')} style={{ ...INPUT_NO_ICON_STYLE }} {...register('last_name')} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                {t('auth.register.role')}
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0', pointerEvents: 'none' }}>badge</span>
                <select
                  style={{ ...INPUT_STYLE, paddingRight: 14, appearance: 'none', cursor: 'pointer' }}
                  {...register('role')}
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: '#091327', color: '#fff' }}>
                      {t(`roles.${opt.value}`)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#8d90a0', pointerEvents: 'none' }}>
                  expand_more
                </span>
              </div>
            </div>

            <Field label={t('auth.register.password')} icon="lock" type={showPass ? 'text' : 'password'} placeholder={t('auth.register.passwordPlaceholder')}
              showToggle onToggle={() => setShowPass(v => !v)} showPass={showPass}
              register={register('password', { required: t('forms.required'), minLength: { value: 6, message: t('forms.passwordTooShort') } })}
              error={errors.password} />

            <Field label={t('auth.register.confirmPassword')} icon="lock_reset" type={showConfirm ? 'text' : 'password'} placeholder={t('auth.register.confirmPlaceholder')}
              showToggle onToggle={() => setShowConfirm(v => !v)} showPass={showConfirm}
              register={register('password_confirm', {
                required: t('forms.required'),
                validate: v => v === watch('password') || t('forms.passwordMismatch'),
              })}
              error={errors.password_confirm} />

            {apiError && (
              <div style={{ padding: '10px 14px', background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb4ab', flexShrink: 0, marginTop: 1 }}>error</span>
                <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab', fontFamily: "'Space Mono', monospace", wordBreak: 'break-word' }}>{apiError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                paddingTop: 14,
                paddingBottom: 14,
                borderRadius: 8,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(37,99,235,0.3)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.register.submitting')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
                  {t('auth.register.submit')}
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#8d90a0', margin: 0 }}>
              {t('auth.register.alreadyRegistered')}{' '}
              <Link to="/login" style={{ color: '#b4c5ff', fontWeight: 600, textDecoration: 'none' }}>
                {t('auth.register.loginLink')}
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
