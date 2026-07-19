import { useState, useRef, useEffect, useCallback } from 'react'
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
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    setError('')

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }

    // Auto-submit if all filled
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
        alert('Demo Mode: New OTP is ' + data.demo_otp)
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

  const inputStyle = (index) => ({
    width: 56,
    height: 64,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 800,
    background: 'rgba(4,14,33,0.9)',
    border: `2px solid ${otp[index] ? 'rgba(37,99,235,0.8)' : error ? 'rgba(255,100,100,0.4)' : 'rgba(180,197,255,0.15)'}`,
    borderRadius: 12,
    color: otp[index] ? '#fff' : '#8d90a0',
    outline: 'none',
    cursor: 'text',
    transition: 'all 0.15s ease',
    boxShadow: otp[index] ? '0 0 16px rgba(37,99,235,0.35), inset 0 0 0 1px rgba(37,99,235,0.3)' : 'none',
    fontFamily: "'Space Mono', monospace",
    letterSpacing: 0,
  })

  return (
    <main style={{ display: 'flex', minHeight: '100vh', background: '#040e21', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
      {/* Language Selector */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <LanguageSelector />
      </div>

      {/* Cyber grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(37,99,235,0.15)',
            border: '2px solid rgba(37,99,235,0.4)',
            marginBottom: 12,
            animation: 'shieldPulse 3s ease-in-out infinite',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{t('landing.hero.title', 'SmartPol AI')}</h1>
          <p style={{ fontSize: 11, color: '#4cd7f6', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '4px 0 0', fontFamily: "'Space Mono', monospace" }}>
            {t('auth.otp.subtitle')}
          </p>
        </div>

        {/* Glass Card */}
        <div style={{
          background: 'rgba(16,26,46,0.8)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(180,197,255,0.12)',
          borderRadius: 20,
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(4,166,100,0.15)',
                border: '2px solid rgba(4,166,100,0.4)',
                marginBottom: 20,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#10b981', fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{t('auth.otp.successTitle')}</h2>
              <p style={{ fontSize: 14, color: '#8d90a0', margin: 0 }}>{t('auth.otp.successMessage')}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(37,99,235,0.12)',
                  border: '1.5px solid rgba(37,99,235,0.3)',
                  marginBottom: 16,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#4cd7f6' }}>mark_email_read</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{t('auth.otp.title')}</h2>
                <p style={{ fontSize: 13, color: '#8d90a0', margin: 0, lineHeight: 1.6 }}>
                  {t('auth.otp.description')}
                </p>
              </div>

              {/* OTP Inputs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
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
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(76,215,246,0.8)'
                      e.target.style.boxShadow = '0 0 20px rgba(76,215,246,0.3), inset 0 0 0 1px rgba(76,215,246,0.3)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = otp[index] ? 'rgba(37,99,235,0.8)' : error ? 'rgba(255,100,100,0.4)' : 'rgba(180,197,255,0.15)'
                      e.target.style.boxShadow = otp[index] ? '0 0 16px rgba(37,99,235,0.35)' : 'none'
                    }}
                    style={inputStyle(index)}
                    disabled={loading}
                    autoFocus={index === 0}
                    id={`otp-input-${index}`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb4ab', flexShrink: 0 }}>error</span>
                  <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab', fontFamily: "'Space Mono', monospace" }}>{error}</p>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={() => handleVerify()}
                disabled={loading || otp.some(d => !d)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: loading || otp.some(d => !d) ? 'not-allowed' : 'pointer',
                  background: otp.every(d => d) ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(37,99,235,0.3)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: otp.every(d => d) ? '0 0 24px rgba(37,99,235,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.8 : 1,
                  marginBottom: 20,
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('auth.otp.verifying')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>verified_user</span>
                    {t('auth.otp.verify')}
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div style={{ textAlign: 'center' }}>
                {!canResend ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8d90a0' }}>timer</span>
                    <p style={{ margin: 0, fontSize: 13, color: '#8d90a0' }}>
                      {t('auth.otp.resendIn')}{' '}
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        color: countdown <= 30 ? '#fbbf24' : '#4cd7f6',
                        fontWeight: 700,
                        fontSize: 15,
                      }}>
                        {formatTime(countdown)}
                      </span>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: resending ? 'not-allowed' : 'pointer',
                      color: resending ? '#8d90a0' : '#b4c5ff',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      margin: '0 auto',
                      transition: 'color 0.2s',
                      padding: 4,
                    }}
                    onMouseEnter={e => { if (!resending) e.currentTarget.style.color = '#4cd7f6' }}
                    onMouseLeave={e => { if (!resending) e.currentTarget.style.color = '#b4c5ff' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                    {resending ? t('auth.otp.resending') : t('auth.otp.resend')}
                  </button>
                )}
              </div>

              {/* Security note */}
              <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(180,197,255,0.1)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4cd7f6', flexShrink: 0, marginTop: 1 }}>info</span>
                <p style={{ margin: 0, fontSize: 12, color: '#8d90a0', lineHeight: 1.5 }}>{t('auth.otp.securityNote')}</p>
              </div>

              {/* Back to register */}
              <p style={{ textAlign: 'center', marginTop: 20, margin: '20px 0 0', fontSize: 13, color: '#8d90a0' }}>
                {t('auth.otp.wrongEmail')}{' '}
                <Link to="/register" style={{ color: '#b4c5ff', fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => { e.target.style.color = '#4cd7f6' }}
                  onMouseLeave={e => { e.target.style.color = '#b4c5ff' }}>
                  {t('auth.otp.reRegister')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shieldPulse { 0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 40px rgba(37,99,235,0.6); } }
      `}</style>
    </main>
  )
}
