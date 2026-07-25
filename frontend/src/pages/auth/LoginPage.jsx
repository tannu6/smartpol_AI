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
    <main className="flex min-h-screen w-full bg-surface-container-lowest text-on-surface">
      <div className="absolute top-5 right-5 z-50 hidden lg:block">
        <LanguageSelector />
      </div>

      {/* LEFT PANEL — Hero (Attractive original design) */}
      <section className="hidden lg:flex relative flex-col items-center justify-center w-[58%] overflow-hidden bg-gradient-to-br from-[#040e21] via-[#091327] to-[#0a1a3a] border-r border-outline-variant/10">
        {/* Grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-25" />

        {/* Radial glow */}
        <div className="absolute top-[35%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/10 to-transparent blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 animate-fade-in">
          {/* Shield icon */}
          <div className="mb-7">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-primary/15 border-2 border-primary/45 animate-pulse">
              <span className="material-symbols-outlined text-primary text-5xl font-fill-1 drop-shadow-[0_0_10px_rgba(180,197,255,0.4)]">shield</span>
            </div>
          </div>

          <h1 className="text-display-lg text-on-surface font-extrabold mb-2 tracking-tight">
            {t('landing.hero.title', 'SmartPol AI')}
          </h1>
          <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-10 opacity-90 font-mono-data">
            {t('landing.hero.subtitle', 'AI Powered Smart Policing System')}
          </p>

          {/* Status badges */}
          <div className="flex gap-3 justify-center flex-wrap">
            {[
              { label: t('auth.login.badges.secureCore', 'SECURE CORE'), value: t('auth.login.badges.online', 'ONLINE'), color: 'text-secondary border-secondary/25 bg-secondary/5' },
              { label: t('auth.login.badges.encryption', 'ENCRYPTION'), value: 'AES-256', color: 'text-primary border-primary/20 bg-primary/5' },
              { label: t('auth.login.badges.threatLevel', 'THREAT LEVEL'), value: t('auth.login.badges.amber', 'AMBER'), color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' },
            ].map(b => (
              <div key={b.label} className={`px-4 py-2 border rounded-xl backdrop-blur-md ${b.color}`}>
                <div className="text-[9px] font-bold tracking-wider font-mono-data opacity-70">{b.label}</div>
                <div className="text-sm font-bold font-mono-data">{b.value}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="mt-12 flex flex-col gap-3 max-w-[340px] mx-auto">
            {[
              { icon: 'psychology', text: t('auth.login.features.prediction', 'AI-Powered Crime Prediction') },
              { icon: 'hub', text: t('auth.login.features.fusion', 'Real-Time Intelligence Fusion') },
              { icon: 'gps_fixed', text: t('auth.login.features.patrol', 'Live Patrol & War Room') },
              { icon: 'verified_user', text: t('auth.login.features.comms', 'End-to-End Encrypted Comms') },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <span className="material-symbols-outlined text-secondary text-lg">{f.icon}</span>
                <span className="text-sm text-on-surface-variant">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-5 left-5 text-[10px] text-on-surface-variant/50 font-mono-data tracking-wider uppercase">
          {t('auth.login.systemVersion', 'System Version 4.0.2 // Terminal Access // Node 7G')}
        </div>
      </section>

      {/* RIGHT PANEL — Form */}
      <section className="flex-1 flex items-center justify-center p-6 bg-surface-dim min-h-screen">
        <div className="w-full max-w-[440px] animate-slide-up">

          <div className="text-center mb-8 relative lg:hidden">
            <div className="absolute top-[-10px] right-0 scale-90">
              <LanguageSelector />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <span className="material-symbols-outlined text-primary text-3xl font-fill-1">shield</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">{t('landing.hero.title', 'SmartPol AI')}</h2>
          </div>

          {/* Attractive original card structure translated to Tailwind */}
          <div className="bg-surface-container/70 backdrop-blur-xl border border-outline-variant/12 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-transparent" />

            <div className="mb-6">
              <h2 className="text-h2 text-on-surface font-bold mb-1.5">{t('auth.login.title', 'Command Login')}</h2>
              <p className="text-sm text-on-surface-variant/80">{t('auth.login.subtitle', 'Enter your tactical credentials.')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Username */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider mb-1.5 font-mono-data">
                  {t('auth.login.username', 'Username or Email')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/50 pointer-events-none">mail</span>
                  <input
                    type="text"
                    placeholder={t('auth.login.usernamePlaceholder', 'Officer ID / Email')}
                    autoComplete="username"
                    className={`w-full py-3 pl-11 pr-4 bg-surface-container-lowest/80 border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all ${
                      errors.username ? 'border-error/60' : 'border-outline-variant/10'
                    }`}
                    {...register('username', { required: t('forms.required') })}
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-error font-mono-data">{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider mb-1.5 font-mono-data">
                  {t('auth.login.password', 'Password')}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/50 pointer-events-none">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder', '••••••••')}
                    autoComplete="current-password"
                    className={`w-full py-3 pl-11 pr-11 bg-surface-container-lowest/80 border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all ${
                      errors.password ? 'border-error/60' : 'border-outline-variant/10'
                    }`}
                    {...register('password', { required: t('forms.required') })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-1 text-on-surface-variant/50 hover:text-on-surface"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-error font-mono-data">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/10 bg-surface-container-lowest text-primary cursor-pointer accent-primary" />
                  <span className="text-xs text-on-surface-variant/80">{t('auth.login.persistSession', 'Keep me logged in')}</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                  {t('auth.login.forgotPassword', 'Forgot Password?')}
                </Link>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-error">error</span>
                  <p className="text-xs text-error font-mono-data">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || authorized}
                className={`w-full py-3.5 mt-3 rounded-lg border-none font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authorized
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                    : 'bg-primary text-on-primary hover:brightness-105'
                } disabled:opacity-80 disabled:cursor-not-allowed`}
              >
                {authorized ? (
                  <>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    {t('auth.login.authorized', 'Authorized')}
                  </>
                ) : loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    {t('auth.login.submitting', 'Authenticating...')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">login</span>
                    {t('auth.login.submit', 'Login')}
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-[1px] bg-outline-variant/10" />
                <span className="text-[10px] text-on-surface-variant/40 font-mono-data tracking-wider uppercase">
                  {t('auth.login.demoHint', 'Demo System Active')}
                </span>
                <div className="flex-1 h-[1px] bg-outline-variant/10" />
              </div>

              {/* Register link */}
              <p className="text-center text-xs text-on-surface-variant/70 mt-2">
                {t('auth.login.noAccount', 'Don\'t have an account?')} {' '}
                <Link to="/register" className="text-xs font-semibold text-primary hover:text-secondary transition-colors font-semibold">
                  {t('auth.login.registerLink', 'Register here')}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
