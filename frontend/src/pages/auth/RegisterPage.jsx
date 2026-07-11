import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { CyberInput, CyberButton, CyberSelect } from '../../components/ui/Forms'
import { ROLE_LABELS, ROLES } from '../../config/navigation'

export default function RegisterPage() {
  const { register: registerUser, getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, getValues } = useForm({ defaultValues: { role: ROLES.CITIZEN } })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await registerUser(data)
      navigate(getDefaultRoute())
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Registration failed')
      setLoading(false)
    }
  }

  const roleOptions = Object.entries(ROLE_LABELS)
    .filter(([k]) => k !== ROLES.ADMIN && k !== ROLES.SECRET_AGENT)
    .map(([value, label]) => ({ value, label }))

  return (
    <main className="flex min-h-screen items-center justify-center p-md bg-surface-container-lowest">
      <div className="w-full max-w-md glass-panel p-lg lg:p-xl rounded-xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-xs">Register</h2>
        <p className="font-body-sm text-on-surface-variant mb-lg">Create your SmartPol AI account</p>
        <form className="space-y-md" onSubmit={handleSubmit(onSubmit)}>
          <CyberInput label="Username" icon="person" register={register('username', { required: true })} />
          <CyberInput label="Email" icon="mail" type="email" register={register('email', { required: true })} />
          <div className="grid grid-cols-2 gap-md">
            <CyberInput label="First Name" register={register('first_name')} />
            <CyberInput label="Last Name" register={register('last_name')} />
          </div>
          <CyberSelect label="Role" options={roleOptions} register={register('role')} />
          <CyberInput label="Password" icon="lock" type="password" register={register('password', { required: true, minLength: 6 })} />
          <CyberInput label="Confirm Password" icon="lock" type="password" register={register('password_confirm', { required: true, validate: v => v === watch('password') || 'Passwords must match' })} />
          {error && <p className="text-error text-sm">{error}</p>}
          <CyberButton type="submit" loading={loading}>Create Account</CyberButton>
          <p className="text-center text-body-sm text-on-surface-variant">
            Already registered? <Link to="/login" className="text-primary">Login</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
