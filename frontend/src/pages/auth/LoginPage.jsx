import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login, getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const user = await login(data.username, data.password)
      setAuthorized(true)
      setTimeout(() => navigate(getDefaultRoute(user) || '/'), 900)
    } catch (err) {
      setError(err.response?.data?.detail || t('errors.invalidCredentials'))
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#040e21' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }} className="lg-lang-selector hidden lg:block">
        <LanguageSelector />
      </div>

      {/* LEFT PANEL — Hero */}
      <section
        style={{
          display: 'none',
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '58%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #040e21 0%, #091327 40%, #0a1a3a 100%)',
        }}
        className="lg-hero-panel"
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          opacity: 0.8,
        }} />

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 48px', animation: 'fadeInScale 0.8s ease forwards' }}>
          {/* Shield icon */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 120, height: 120,
              borderRadius: '50%',
              background: 'rgba(37,99,235,0.15)',
              border: '2px solid rgba(37,99,235,0.4)',
              animation: 'shieldPulse 3s ease-in-out infinite',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {t('landing.hero.title', 'SmartPol AI')}
          </h1>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#4cd7f6', letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 40px', opacity: 0.9 }}>
            {t('landing.hero.subtitle', 'AI Powered Smart Policing System')}
          </p>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: t('auth.login.badges.secureCore', 'SECURE CORE'), value: t('auth.login.badges.online', 'ONLINE'), color: '#4cd7f6', bg: 'rgba(76,215,246,0.08)', border: 'rgba(76,215,246,0.25)' },
              { label: t('auth.login.badges.encryption', 'ENCRYPTION'), value: 'AES-256', color: '#b4c5ff', bg: 'rgba(180,197,255,0.08)', border: 'rgba(180,197,255,0.2)' },
              { label: t('auth.login.badges.threatLevel', 'THREAT LEVEL'), value: t('auth.login.badges.amber', 'AMBER'), color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
            ].map(b => (
              <div key={b.label} style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${b.border}`,
                background: b.bg,
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: b.color, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace", opacity: 0.7 }}>{b.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: b.color, fontFamily: "'Space Mono', monospace" }}>{b.value}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340, margin: '48px auto 0' }}>
            {[
              { icon: 'psychology', text: t('auth.login.features.prediction', 'AI-Powered Crime Prediction') },
              { icon: 'hub', text: t('auth.login.features.fusion', 'Real-Time Intelligence Fusion') },
              { icon: 'gps_fixed', text: t('auth.login.features.patrol', 'Live Patrol & War Room') },
              { icon: 'verified_user', text: t('auth.login.features.comms', 'End-to-End Encrypted Comms') },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8, background: 'rgba(180,197,255,0.04)', border: '1px solid rgba(180,197,255,0.08)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4cd7f6' }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: '#c3c6d7' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 20, left: 20, fontSize: 10, color: '#8d90a0', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t('auth.login.systemVersion', 'System Version 4.0.2 // Terminal Access // Node 7G')}
        </div>
      </section>

      {/* RIGHT PANEL — Form */}
      <section style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        background: '#091327',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>

          <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative' }} className="mobile-logo">
            <div style={{ position: 'absolute', top: -10, right: 0 }}>
              <LanguageSelector />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(37,99,235,0.15)',
              border: '2px solid rgba(37,99,235,0.3)',
              marginBottom: 12,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>{t('landing.hero.title', 'SmartPol AI')}</h2>
          </div>

          {/* Glass card */}
          <div style={{
            background: 'rgba(16,26,46,0.7)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(180,197,255,0.12)',
            borderRadius: 16,
            padding: '32px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{t('auth.login.title', 'Command Login')}</h2>
              <p style={{ fontSize: 14, color: '#8d90a0', margin: 0 }}>{t('auth.login.subtitle', 'Enter your tactical credentials.')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {t('auth.login.username', 'Username or Email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0', pointerEvents: 'none' }}>mail</span>
                  <input
                    type="text"
                    placeholder={t('auth.login.usernamePlaceholder', 'Officer ID / Email')}
                    autoComplete="username"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      paddingTop: 12,
                      paddingBottom: 12,
                      paddingLeft: 44,
                      paddingRight: 14,
                      background: 'rgba(4,14,33,0.8)',
                      border: errors.username ? '1px solid rgba(255,100,100,0.6)' : '1px solid rgba(180,197,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 1px #2563eb, 0 0 14px rgba(37,99,235,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.username ? 'rgba(255,100,100,0.6)' : 'rgba(180,197,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    {...register('username', { required: t('forms.required') })}
                  />
                </div>
                {errors.username && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {t('auth.login.password', 'Password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0', pointerEvents: 'none' }}>lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      paddingTop: 12,
                      paddingBottom: 12,
                      paddingLeft: 44,
                      paddingRight: 44,
                      background: 'rgba(4,14,33,0.8)',
                      border: errors.password ? '1px solid rgba(255,100,100,0.6)' : '1px solid rgba(180,197,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 1px #2563eb, 0 0 14px rgba(37,99,235,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'rgba(255,100,100,0.6)' : 'rgba(180,197,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    {...register('password', { required: t('forms.required') })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#8d90a0' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{errors.password.message}</p>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
                  <span style={{ fontSize: 13, color: '#8d90a0' }}>{t('auth.login.persistSession', 'Keep me logged in')}</span>
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: '#b4c5ff', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#4cd7f6'} onMouseLeave={e => e.target.style.color = '#b4c5ff'}>
                  {t('auth.login.forgotPassword', 'Forgot Password?')}
                </Link>
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(147,0,10,0.2)',
                  border: '1px solid rgba(255,180,171,0.3)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb4ab' }}>error</span>
                  <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab', fontFamily: "'Space Mono', monospace" }}>{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || authorized}
                style={{
                  width: '100%',
                  paddingTop: 14,
                  paddingBottom: 14,
                  borderRadius: 8,
                  border: 'none',
                  cursor: loading || authorized ? 'not-allowed' : 'pointer',
                  background: authorized ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.3s ease',
                  boxShadow: authorized ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 20px rgba(37,99,235,0.3)',
                  opacity: loading ? 0.8 : 1,
                }}
                onMouseEnter={e => { if (!loading && !authorized) e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.5)'; }}
                onMouseLeave={e => { if (!loading && !authorized) e.currentTarget.style.boxShadow = '0 0 20px rgba(37,99,235,0.3)'; }}
              >
                {authorized ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                    {t('auth.login.authorized', 'Authorized')}
                  </>
                ) : loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('auth.login.submitting', 'Authenticating...')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
                    {t('auth.login.submit', 'Login')}
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(180,197,255,0.1)' }} />
                <span style={{ fontSize: 10, color: '#8d90a0', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {t('auth.login.demoHint', 'Demo System Active')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(180,197,255,0.1)' }} />
              </div>

              {/* Register link */}
              <p style={{ textAlign: 'center', fontSize: 14, color: '#8d90a0', margin: 0 }}>
                {t('auth.login.noAccount', 'Don\'t have an account?')} {' '}
                <Link to="/register" style={{ color: '#b4c5ff', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#4cd7f6'} onMouseLeave={e => e.target.style.color = '#b4c5ff'}>
                  {t('auth.login.registerLink', 'Register here')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .lg-hero-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </main>
  )
}
