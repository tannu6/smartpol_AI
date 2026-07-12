import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  useEffect(() => {
    if (!token) {
      setApiError(t('auth.resetPassword.invalidTokenMessage'))
    }
  }, [token, t])

  const onSubmit = async (data) => {
    if (!token) return
    setLoading(true)
    setApiError('')
    try {
      await authService.resetPassword(token, data.password, data.password_confirm)
      setSuccess(true)
    } catch (err) {
      setApiError(err.response?.data?.detail || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#040e21', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <LanguageSelector />
      </div>

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
        <div style={{
          background: 'rgba(16,26,46,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(180,197,255,0.12)',
          borderRadius: 16,
          padding: '36px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

          {!token ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ffb4ab', marginBottom: 16 }}>error</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t('auth.resetPassword.invalidToken')}</h2>
              <p style={{ fontSize: 14, color: '#8d90a0', marginBottom: 24 }}>{t('auth.resetPassword.invalidTokenMessage')}</p>
              <Link to="/login" style={{ color: '#b4c5ff', textDecoration: 'none', fontWeight: 600 }}>{t('auth.forgotPassword.returnToLogin')}</Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(4,166,100,0.15)',
                border: '2px solid rgba(4,166,100,0.4)',
                marginBottom: 20,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#4cd7f6' }}>check_circle</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{t('auth.resetPassword.successTitle')}</h2>
              <p style={{ fontSize: 14, color: '#8d90a0', margin: '0 0 28px', lineHeight: 1.6 }}>
                {t('auth.resetPassword.successMessage')}
              </p>
              <Link to="/login"
                style={{
                  display: 'inline-block', padding: '12px 28px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}
              >
                {t('auth.resetPassword.goToLogin')}
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{t('auth.resetPassword.title')}</h2>
                <p style={{ fontSize: 14, color: '#8d90a0', margin: 0 }}>{t('auth.resetPassword.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {t('auth.resetPassword.newPassword')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0' }}>lock</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '12px 44px',
                        background: 'rgba(4,14,33,0.8)', border: errors.password ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(180,197,255,0.1)',
                        borderRadius: 8, color: '#fff', fontSize: 15, outline: 'none'
                      }}
                      {...register('password', { required: t('forms.required'), minLength: { value: 6, message: t('forms.passwordTooShort') } })}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8d90a0', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {errors.password && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{errors.password.message}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {t('auth.resetPassword.confirmPassword')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8d90a0' }}>lock_reset</span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '12px 44px',
                        background: 'rgba(4,14,33,0.8)', border: errors.password_confirm ? '1px solid rgba(255,100,100,0.5)' : '1px solid rgba(180,197,255,0.1)',
                        borderRadius: 8, color: '#fff', fontSize: 15, outline: 'none'
                      }}
                      {...register('password_confirm', { 
                        required: t('forms.required'),
                        validate: v => v === watch('password') || t('forms.passwordMismatch')
                      })}
                    />
                  </div>
                  {errors.password_confirm && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ffb4ab' }}>{errors.password_confirm.message}</p>}
                </div>

                {apiError && (
                  <div style={{ padding: '10px', background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, display: 'flex', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: '#ffb4ab', fontSize: 18 }}>error</span>
                    <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab' }}>{apiError}</p>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', fontSize: 14, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8, opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
