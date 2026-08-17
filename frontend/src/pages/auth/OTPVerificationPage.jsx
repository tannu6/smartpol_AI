import { useState, useRef, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 120 // 2 minutes in seconds

export default function OTPVerificationPage() {
  const { t } = useTranslation()
  const { getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id')
  const demoOtp = searchParams.get('demo_otp')

  const [otp, setOtp] = useState(() => {
    if (demoOtp && demoOtp.length === OTP_LENGTH) {
      return demoOtp.split('')
    }
    return Array(OTP_LENGTH).fill('')
  })
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])
  const timerRef = useRef(null)

  // Redirect if no user_id
  useEffect(() => {
    if (!userId) navigate('/register', { replace: true })
  }, [userId, navigate])

  // Countdown timer
  useEffect(() => {
    setCountdown(RESEND_COOLDOWN)
    setCanResend(false)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const focusInput = (index) => {
    if (inputRefs.current[index]) inputRefs.current[index].focus()
  }

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }

    if (digit && index === OTP_LENGTH - 1) {
      const allFilled = newOtp.every(d => d !== '')
      if (allFilled) {
        handleVerify(newOtp.join(''))
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        focusInput(index - 1)
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = [...Array(OTP_LENGTH).fill('')]
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
    if (pasted.length === OTP_LENGTH) {
      handleVerify(pasted)
    }
  }

  const handleVerify = useCallback(async (code) => {
    const finalCode = code || otp.join('')
    if (finalCode.length !== OTP_LENGTH) {
      setError(t('auth.otp.enterAllDigits'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await authService.verifyOtp(userId, finalCode)
      localStorage.setItem('accessToken', data.tokens.access)
      localStorage.setItem('refreshToken', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      setSuccess(true)
      setTimeout(() => {
        const route = { citizen: '/citizen/complaint', officer: '/officer/dashboard', supervisor: '/supervisor/analytics', secret_agent: '/agent/command', admin: '/admin/dashboard' }
        navigate(route[data.user.role] || '/login', { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.otp.invalidOtp'))
      setOtp(Array(OTP_LENGTH).fill(''))
      focusInput(0)
    } finally {
      setLoading(false)
    }
  }, [otp, userId, navigate, t])

  const handleResend = async () => {
    if (!canResend || resending) return
    setResending(true)
    setError('')
    try {
      const { data } = await authService.resendOtp(userId)
      if (data && data.demo_otp) {
        toast.success(`New OTP sent. Check your email.`, { duration: 4000 })
        setOtp(data.demo_otp.split(''))
      } else {
        setOtp(Array(OTP_LENGTH).fill(''))
      }
      setCountdown(RESEND_COOLDOWN)
      setCanResend(false)
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      focusInput(0)
    } catch (err) {
      setError(err.response?.data?.detail || t('errors.generic'))
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-surface-container-lowest text-on-surface items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-50">
        <LanguageSelector />
      </div>

      <div className="fixed inset-0 z-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-0 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px] animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-3 animate-pulse">
            <span className="material-symbols-outlined text-primary text-3xl font-fill-1">shield</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{t('landing.hero.title', 'SmartPol AI')}</h1>
          <p className="text-[11px] font-semibold text-secondary tracking-widest uppercase mt-1 opacity-90 font-mono-data">
            {t('auth.otp.subtitle')}
          </p>
        </div>

        {/* Clean Panel Card */}
        <div className="bg-surface-container border border-outline-variant/15 rounded-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-transparent" />

          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-5">
                <span className="material-symbols-outlined text-green-500 text-4xl font-fill-1">verified</span>
              </div>
              <h2 className="text-h2 text-on-surface mb-2">{t('auth.otp.successTitle')}</h2>
              <p className="text-sm text-on-surface-variant">{t('auth.otp.successMessage')}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <span className="material-symbols-outlined text-secondary text-2xl">mark_email_read</span>
                </div>
                <h2 className="text-h2 text-on-surface mb-2">{t('auth.otp.title')}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {t('auth.otp.description')}
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 text-center text-xl font-bold bg-surface-container-lowest border rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all font-mono-data ${
                      digit ? 'border-primary' : error ? 'border-error/40' : 'border-outline-variant/10'
                    }`}
                    disabled={loading}
                    autoFocus={index === 0}
                    id={`otp-input-${index}`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-lg text-error flex-shrink-0">error</span>
                  <p className="text-xs text-error font-mono-data">{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={() => handleVerify()}
                disabled={loading || otp.some(d => !d)}
                className={`w-full py-3.5 rounded-lg border-none font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  otp.every(d => d) ? 'bg-primary text-on-primary hover:brightness-105' : 'bg-primary/20 text-on-primary/40'
                } disabled:opacity-85 disabled:cursor-not-allowed mb-5`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    {t('auth.otp.verifying')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    {t('auth.otp.verify')}
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                {!canResend ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">timer</span>
                    <p className="text-xs text-on-surface-variant">
                      {t('auth.otp.resendIn')}{' '}
                      <span className={`font-mono-data font-bold text-sm ${countdown <= 30 ? 'text-yellow-400' : 'text-secondary'}`}>
                        {formatTime(countdown)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="bg-transparent border-none cursor-pointer text-primary hover:text-secondary text-xs font-semibold flex items-center gap-1.5 mx-auto transition-colors p-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    {resending ? t('auth.otp.resending') : t('auth.otp.resend')}
                  </button>
                )}
              </div>

              {/* Security note */}
              <div className="mt-5 p-3 bg-primary/5 border border-primary/10 rounded-lg flex gap-2 items-start">
                <span className="material-symbols-outlined text-base text-secondary flex-shrink-0 mt-0.5">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t('auth.otp.securityNote')}</p>
              </div>

              {/* Back to register */}
              <p className="text-center mt-5 text-xs text-on-surface-variant">
                {t('auth.otp.wrongEmail')}{' '}
                <Link to="/register" className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                  {t('auth.otp.reRegister')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
