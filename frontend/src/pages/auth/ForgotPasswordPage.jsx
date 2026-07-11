import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/api'
import { CyberInput, CyberButton } from '../../components/ui/Forms'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-md bg-surface-container-lowest">
      <div className="w-full max-w-md glass-panel p-lg rounded-xl">
        <h2 className="font-headline-md text-primary mb-xs">Emergency Reset</h2>
        <p className="font-body-sm text-on-surface-variant mb-lg">Enter your registered email for reset instructions</p>
        {sent ? (
          <div className="text-center space-y-md">
            <span className="material-symbols-outlined text-secondary text-5xl">mark_email_read</span>
            <p className="text-on-surface">If the email exists, reset instructions have been sent.</p>
            <Link to="/login" className="text-primary hover:text-secondary">Back to Login</Link>
          </div>
        ) : (
          <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
            <CyberInput label="Email" icon="mail" type="email" register={register('email', { required: true })} />
            <CyberButton type="submit" loading={loading}>Send Reset Link</CyberButton>
            <Link to="/login" className="block text-center text-primary text-sm">Back to Login</Link>
          </form>
        )}
      </div>
    </main>
  )
}
