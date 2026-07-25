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
    <main className="flex min-h-screen w-full bg-surface-container-lowest text-on-surface items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-50">
        <LanguageSelector />
      </div>

      {/* Background */}
      <div className="fixed inset-0 z-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">

        {/* Back to login */}
        <div className="mb-5">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface-container border border-outline-variant/15 rounded-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-transparent" />

          {sent ? (
            /* Success state */
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <span className="material-symbols-outlined text-secondary text-4xl font-fill-1">mark_email_read</span>
              </div>
              <h2 className="text-h2 text-on-surface mb-3">{t('auth.forgotPassword.successTitle')}</h2>
              <p className="text-sm text-on-surface-variant mb-2 leading-relaxed">
                {t('auth.forgotPassword.successMessage')}
              </p>
              <p className="text-xs text-on-surface-variant/70 mb-7 font-mono-data">
                {t('auth.forgotPassword.successNote')}
              </p>
              <Link
                to="/login"
                className="w-full py-3.5 rounded-lg border-none bg-primary text-on-primary font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer hover:brightness-105"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                {t('auth.forgotPassword.returnToLogin')}
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Icon */}
              <div className="mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                </div>
                <h2 className="text-h2 text-on-surface mb-1.5">{t('auth.forgotPassword.title')}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t('auth.forgotPassword.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    {t('auth.forgotPassword.email')}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">mail</span>
                    <input
                      type="email"
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      autoComplete="email"
                      className={`w-full py-3 pl-11 pr-4 bg-surface-container-lowest border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all ${
                        errors.email ? 'border-error/60' : 'border-outline-variant/10'
                      }`}
                      {...register('email', {
                        required: t('forms.required'),
                        pattern: { value: /\S+@\S+\.\S+/, message: t('forms.invalidEmail') },
                      })}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
                </div>

                {/* API error */}
                {apiError && (
                  <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-error">error</span>
                    <p className="text-xs text-error">{apiError}</p>
                  </div>
                )}

                {/* Info box */}
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-secondary flex-shrink-0 mt-0.5">info</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {t('auth.forgotPassword.securityNote')}
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg border-none bg-primary text-on-primary font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer hover:brightness-105 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                      {t('auth.forgotPassword.submitting')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      {t('auth.forgotPassword.submit')}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-on-surface-variant mt-2">
                  {t('auth.forgotPassword.rememberedPassword')} {' '}
                  <Link to="/login" className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
