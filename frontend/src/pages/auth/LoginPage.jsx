import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { CyberInput, CyberButton } from '../../components/ui/Forms'

export default function LoginPage() {
  const { login, getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await login(data.username, data.password)
      setAuthorized(true)
      setTimeout(() => navigate(getDefaultRoute() || '/'), 800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <main className="flex h-screen w-full">
      <section className="relative hidden lg:flex flex-col items-center justify-center w-3/5 overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div className="relative z-20 flex flex-col items-center animate-fade-in text-center px-xl">
          <div className="mb-lg" style={{ animation: 'shieldPulse 4s infinite ease-in-out' }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 160, fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-white mb-md tracking-tight">SmartPol AI</h1>
          <p className="font-title-sm text-title-sm text-secondary uppercase tracking-[0.2em] opacity-80 max-w-md">AI Powered Smart Policing System</p>
          <div className="mt-xl flex gap-md">
            <div className="px-md py-sm border border-primary/20 bg-primary/5 backdrop-blur-md rounded-lg">
              <p className="font-mono-data text-mono-data text-primary">SECURE CORE: ONLINE</p>
            </div>
            <div className="px-md py-sm border border-secondary/20 bg-secondary/5 backdrop-blur-md rounded-lg">
              <p className="font-mono-data text-mono-data text-secondary">ENCRYPTION: AES-256</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-md left-md font-mono-data text-xs text-outline opacity-40 uppercase tracking-widest">
          System Version 4.0.2 // Terminal Access // Node 7G
        </div>
      </section>
      <section className="w-full lg:w-2/5 flex items-center justify-center p-md lg:p-xl bg-surface">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex flex-col items-center mb-xl">
            <span className="material-symbols-outlined text-primary mb-sm" style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}>shield</span>
            <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">SmartPol AI</h2>
          </div>
          <div className="glass-panel p-lg lg:p-xl rounded-xl shadow-2xl">
            <div className="mb-lg">
              <h2 className="font-headline-md text-headline-md text-white mb-xs">Command Login</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your tactical credentials to access the grid.</p>
            </div>
            <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
              <CyberInput label="Operator ID / Email" icon="mail" placeholder="operator@smartpol.gov" register={register('username', { required: true })} />
              <CyberInput label="Access Key" icon="lock" type="password" placeholder="••••••••••••" register={register('password', { required: true })} />
              {error && <p className="text-error text-sm font-mono-data">{error}</p>}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-outline/30 bg-surface text-primary" />
                  <span className="ml-sm font-body-sm text-on-surface-variant">Persistent Session</span>
                </label>
                <Link to="/forgot-password" className="text-[12px] font-semibold text-primary hover:text-secondary">Emergency Reset</Link>
              </div>
              <CyberButton type="submit" loading={loading && !authorized}>
                {authorized ? (
                  <><span className="material-symbols-outlined text-[20px]">check_circle</span> AUTHORIZED</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">login</span> Authorize Access</>
                )}
              </CyberButton>
              <div className="relative flex items-center py-sm">
                <div className="flex-grow border-t border-outline/20" />
                <span className="flex-shrink mx-md font-label-caps text-[10px] text-outline uppercase">Demo: password123</span>
                <div className="flex-grow border-t border-outline/20" />
              </div>
              <p className="text-center text-body-sm text-on-surface-variant">
                No account? <Link to="/register" className="text-primary hover:text-secondary">Register</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
