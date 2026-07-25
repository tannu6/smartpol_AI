import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppLayout from '../../components/layout/AppLayout'
import { authService } from '../../services/api'
import { CyberInput, CyberButton } from '../../components/ui/Forms'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { ShieldAlert, Award, MapPin, Phone, User as UserIcon, Terminal, CheckCircle2 } from 'lucide-react'

export default function OfficerProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      authService.me()
        .then(({ data }) => reset(data))
        .catch(() => {})
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    setSuccess(false)
    setErrorMsg('')
    try {
      await authService.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        district: data.district,
        badge_id: data.badge_id
      })
      setSuccess(true)
      // Refresh local user state if necessary
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || t('common.error_occurred', 'An error occurred during profiling transmission.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="SmartPol AI" subtitle="Tactical Profile Console">
      <div className="p-lg max-w-4xl mx-auto space-y-lg">
        
        {/* Header summary banner */}
        <div className="glass-panel p-lg rounded-xl border border-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <Award size={36} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface uppercase tracking-tight flex items-center gap-2">
                {user?.first_name} {user?.last_name}
                <span className="text-[10px] font-mono-data tracking-widest px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container border border-primary/20">
                  {user?.role?.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant font-mono-data mt-1 flex items-center gap-1">
                <ShieldAlert size={14} className="text-secondary" /> Badge Reference: {user?.badge_id || 'NOT ASSIGNED'}
              </p>
            </div>
          </div>
          <div className="bg-black/30 border border-outline-variant p-md rounded-lg text-xs font-mono-data space-y-1">
            <div><span className="text-secondary">Working Sector:</span> {user?.district || 'Pending Sector'}</div>
            <div><span className="text-secondary">District Center:</span> Sector 7G Command</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Form container */}
          <div className="lg:col-span-2 glass-panel p-xl rounded-xl border border-outline-variant space-y-md">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b border-primary/10 pb-2">
              <Terminal size={16} /> Operational Profile Registry
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <CyberInput 
                  label="First Name" 
                  {...register('first_name', { required: true })}
                  error={errors.first_name && "Required field"}
                />
                <CyberInput 
                  label="Last Name" 
                  {...register('last_name', { required: true })}
                  error={errors.last_name && "Required field"}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <CyberInput 
                  label="Badge ID / Reference" 
                  {...register('badge_id')}
                />
                <CyberInput 
                  label="Working Sector / District" 
                  {...register('district')}
                />
              </div>

              <div>
                <CyberInput 
                  label="Operational Phone Number" 
                  {...register('phone')}
                />
              </div>

              {errorMsg && (
                <div className="p-md rounded bg-error/10 border border-error/30 text-error text-sm font-mono-data">
                  {errorMsg}
                </div>
              )}
              
              {success && (
                <div className="p-md rounded bg-secondary/10 border border-secondary/30 text-secondary text-sm font-mono-data flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-secondary" />
                  Profile updated successfully. Refreshing secure session...
                </div>
              )}

              <div className="pt-md">
                <CyberButton type="submit" loading={loading} className="w-full md:w-auto">
                  Sync Profile Parameters
                </CyberButton>
              </div>
            </form>
          </div>

          {/* Quick info panel */}
          <div className="glass-panel p-lg rounded-xl border border-outline-variant flex flex-col justify-between space-y-lg">
            <div className="space-y-md">
              <h3 className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                <ShieldAlert size={14} /> Security Directives
              </h3>
              <div className="text-xs text-on-surface-variant space-y-md leading-relaxed font-mono-data">
                <p>1. Operational profiles contain critical credentials required for dispatching responding units.</p>
                <p>2. Keep working sectors/districts updated to ensure dispatch and priority queues route cases correctly.</p>
                <p>3. Changing parameters requires terminal re-authentication.</p>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-lg space-y-sm">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <MapPin size={16} className="text-primary" />
                <span>Sector 7G Central Command</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <Phone size={16} className="text-primary" />
                <span>+91-98765-SHIELD</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
