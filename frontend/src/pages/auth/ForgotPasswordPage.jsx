import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch {
      setApiError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#040e21', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <LanguageSelector />
      </div>

      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }} />
      <div style={{
        position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>

        {/* Back to login */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8d90a0', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#b4c5ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#8d90a0'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(16,26,46,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(180,197,255,0.12)',
          borderRadius: 16,
          padding: '36px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(4,166,100,0.15)',
                border: '2px solid rgba(4,166,100,0.4)',
                marginBottom: 20,
                animation: 'fadeInScale 0.5s ease forwards',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#4cd7f6', fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t('auth.forgotPassword.successTitle')}</h2>
              <p style={{ fontSize: 14, color: '#8d90a0', margin: '0 0 8px', lineHeight: 1.6 }}>
                {t('auth.forgotPassword.successMessage')}
              </p>
              <p style={{ fontSize: 12, color: '#8d90a0', margin: '0 0 28px', fontFamily: "'Space Mono', monospace" }}>
                {t('auth.forgotPassword.successNote')}
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  boxShadow: '0 0 20px rgba(37,99,235,0.3)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(37,99,235,0.3)'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                {t('auth.forgotPassword.returnToLogin')}
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Icon */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 52, height: 52, borderRadius: 12,
                  background: 'rgba(37,99,235,0.12)',
                  border: '1.5px solid rgba(37,99,235,0.3)',
                  marginBottom: 16,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#b4c5ff' }}>lock_reset</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{t('auth.forgotPassword.title')}</h2>
                <p style={{ fontSize: 14, color: '#8d90a0', margin: 0, lineHeight: 1.5 }}>
                  {t('auth.forgotPassword.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {t('auth.forgotPassword.email')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0', pointerEvents: 'none' }}>mail</span>
                    <input
                      type="email"
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      autoComplete="email"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingTop: 12,
                        paddingBottom: 12,
                        paddingLeft: 44,
                        paddingRight: 14,
                        background: 'rgba(4,14,33,0.8)',
                        border: errors.email ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(180,197,255,0.1)',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 15,
                        outline: 'none',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 1px #2563eb, 0 0 14px rgba(37,99,235,0.2)'; }}
                      onBlur={e => { e.target.style.borderColor = errors.email ? 'rgba(255,100,100,0.5)' : 'rgba(180,197,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      {...register('email', {
                        required: t('forms.required'),
                        pattern: { value: /\S+@\S+\.\S+/, message: t('forms.invalidEmail') },
                      })}
                    />
                  </div>
                  {errors.email && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{errors.email.message}</p>}
                </div>

                {/* API error */}
                {apiError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb4ab' }}>error</span>
                    <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab' }}>{apiError}</p>
                  </div>
                )}

                {/* Info box */}
                <div style={{ padding: '10px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(180,197,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#4cd7f6', flexShrink: 0, marginTop: 1 }}>info</span>
                  <p style={{ margin: 0, fontSize: 12, color: '#c3c6d7', lineHeight: 1.5 }}>
                    {t('auth.forgotPassword.securityNote')}
                  </p>
                </div>

                {/* Submit */}
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
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.5)'; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 20px rgba(37,99,235,0.3)'; }}
                >
                  {loading ? (
                    <>
                      <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('auth.forgotPassword.submitting')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                      {t('auth.forgotPassword.submit')}
                    </>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#8d90a0', margin: 0 }}>
                  {t('auth.forgotPassword.rememberedPassword')} {' '}
                  <Link to="/login" style={{ color: '#b4c5ff', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#4cd7f6'} onMouseLeave={e => e.target.style.color = '#b4c5ff'}>
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
