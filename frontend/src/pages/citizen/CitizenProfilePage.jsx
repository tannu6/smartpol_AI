import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppLayout from '../../components/layout/AppLayout'
import { authService } from '../../services/api'
import { CyberInput, CyberButton } from '../../components/ui/Forms'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function CitizenProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      authService.me().then(({ data }) => reset(data)).catch(() => {})
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
        district: data.district
      })
      setSuccess(true)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || t('common.error_occurred', 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="SmartPol AI" subtitle={t('profile.subtitle', 'Manage Profile')}>
      <div className="p-lg max-w-2xl mx-auto space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('profile.title', 'Operative Profile')}</h2>
        
        <div className="glass-panel p-xl rounded-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <CyberInput 
                label={t('profile.first_name', 'First Name')} 
                {...register('first_name', { required: true })}
                error={errors.first_name && t('common.required', 'Required')}
              />
              <CyberInput 
                label={t('profile.last_name', 'Last Name')} 
                {...register('last_name', { required: true })}
                error={errors.last_name && t('common.required', 'Required')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <CyberInput 
                label={t('profile.phone', 'Phone Number')} 
                {...register('phone')}
              />
              <CyberInput 
                label={t('profile.district', 'District / Location')} 
                {...register('district')}
              />
            </div>

            {errorMsg && (
              <div className="p-md rounded bg-error/10 border border-error/30 text-error text-sm font-mono-data">
                {errorMsg}
              </div>
            )}
            
            {success && (
              <div className="p-md rounded bg-secondary/10 border border-secondary/30 text-secondary text-sm font-mono-data flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {t('profile.success', 'Profile updated securely.')}
              </div>
            )}

            <div className="pt-md">
              <CyberButton type="submit" loading={loading} className="w-full md:w-auto">
                {t('profile.save', 'Update Protocol Data')}
              </CyberButton>
            </div>
            
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
