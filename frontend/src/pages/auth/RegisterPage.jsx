import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../components/ui/LanguageSelector'
import { ROLE_LABELS, ROLES } from '../../config/navigation'
import { policeStationService } from '../../services/api'

function Field({ label, icon, type = 'text', register: reg, error, placeholder, showToggle, onToggle, showPass }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full py-3 pr-4 bg-surface-container-lowest border rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all ${
            icon ? 'pl-11' : 'pl-4'
          } ${showToggle ? 'pr-11' : 'pr-4'} ${error ? 'border-error/60' : 'border-outline-variant/10'}`}
          {...reg}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-1 text-on-surface-variant/60 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error.message || error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [stations, setStations] = useState([])

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { role: ROLES.CITIZEN, district: 'Ahmedabad' },
  })

  const selectedRole = watch('role')

  useEffect(() => {
    async function loadStations() {
      try {
        const { data } = await policeStationService.list()
        const list = Array.isArray(data) ? data : data?.results || []
        setStations(list)
      } catch (err) {
        console.error('Failed to load stations', err)
      }
    }
    loadStations()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    try {
      // If officer selected a parent station, find station object and populate department if empty
      if (data.parent_station && stations.length > 0) {
        const st = stations.find(s => String(s.id) === String(data.parent_station))
        if (st) {
          if (st.is_cyber_specialized) {
            data.department = 'Cyber Crime Cell'
            data.unit = 'Ahmedabad Cyber Crime Division'
          } else if (!data.department) {
            data.department = 'General Police'
            data.unit = st.area || 'Local Police Station'
          }
        }
      }

      const result = await registerUser(data)
      if (result?.requires_otp && result?.user_id) {
        let url = `/verify-otp?user_id=${result.user_id}`
        navigate(url)
      } else {
        navigate('/login')
      }
    } catch (err) {
      const errorData = err.response?.data
      const msg = errorData?.detail ||
        Object.values(errorData || {}).flat().join(' ') ||
        t('errors.generic')
      setApiError(msg)
      setLoading(false)
    }
  }

  const roleOptions = Object.entries(ROLE_LABELS)
    .filter(([k]) => k !== ROLES.ADMIN && k !== ROLES.SECRET_AGENT)
    .map(([value, label]) => ({ value, label }))

  return (
    <main className="flex min-h-screen w-full bg-surface-container-lowest text-on-surface items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-5 right-5 z-50">
        <LanguageSelector />
      </div>

      <div className="fixed inset-0 z-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="fixed top-[30%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-0 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[500px] animate-slide-up">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <span className="material-symbols-outlined text-primary text-3xl font-fill-1">shield</span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{t('landing.hero.title', 'SmartPol AI')}</h1>
          <p className="text-xs font-semibold text-secondary tracking-widest uppercase mt-1 opacity-90 font-mono-data">
            {t('auth.register.tagline', 'System Enrollment')}
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant/15 rounded-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-transparent" />

          <h2 className="text-h2 text-on-surface mb-1">{t('auth.register.title', 'System Registration')}</h2>
          <p className="text-sm text-on-surface-variant mb-6">{t('auth.register.description', 'Create your operative account')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <Field label={t('auth.register.username', 'Username')} icon="person" placeholder={t('auth.register.usernamePlaceholder', 'e.g. jdoe')}
              register={register('username', { required: t('forms.required'), minLength: { value: 3, message: t('forms.usernameTooShort') } })}
              error={errors.username} />

            <Field label={t('auth.register.email', 'Email Address')} icon="mail" type="email" placeholder={t('auth.register.emailPlaceholder', 'operative@smartpol.gov')}
              register={register('email', { required: t('forms.required'), pattern: { value: /\S+@\S+\.\S+/, message: t('forms.invalidEmail') } })}
              error={errors.email} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t('auth.register.firstName', 'First Name')}
                </label>
                <input
                  placeholder={t('auth.register.firstPlaceholder', 'John')}
                  className="w-full py-3 px-4 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
                  {...register('first_name')}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {t('auth.register.lastName', 'Last Name')}
                </label>
                <input
                  placeholder={t('auth.register.lastPlaceholder', 'Doe')}
                  className="w-full py-3 px-4 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all"
                  {...register('last_name')}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                {t('auth.register.role', 'Select Role')}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">badge</span>
                <select
                  className="w-full py-3 pl-11 pr-10 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all appearance-none cursor-pointer"
                  {...register('role')}
                >
                  {roleOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-surface-container text-on-surface">
                      {t(`roles.${opt.value}`, opt.label)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Officer Registration: Station & Cyber Cell Selection */}
            {selectedRole === 'officer' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Assigned Ahmedabad Police Station / Cyber Cell
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-primary pointer-events-none">local_police</span>
                    <select
                      className="w-full py-3 pl-11 pr-10 bg-surface-container-lowest border border-primary/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all appearance-none cursor-pointer"
                      {...register('parent_station', { required: "Assigned Police Station is required for officers" })}
                    >
                      <option value="">-- Select Ahmedabad Station or Cyber Cell --</option>
                      {stations.map(st => (
                        <option key={st.id} value={st.id} className="bg-surface-container text-on-surface">
                          {st.is_cyber_specialized ? '🌐 [CYBER CELL] ' : '🚓 '} {st.name} ({st.area})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  {errors.parent_station && <p className="mt-1 text-xs text-error">{errors.parent_station.message}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Branch / Department
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">security</span>
                    <select
                      className="w-full py-3 pl-11 pr-10 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25 transition-all appearance-none cursor-pointer"
                      {...register('department')}
                    >
                      <option value="General Police">General Police</option>
                      <option value="Cyber Branch">Cyber Branch</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl text-on-surface-variant/60 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                <Field 
                  label="Officer Badge ID" 
                  icon="badge" 
                  placeholder="e.g. AHM-OFC-4092"
                  register={register('badge_id', { required: "Badge ID is required for officers" })} 
                  error={errors.badge_id} 
                />
              </>
            )}

            {/* Supervisor Registration: Unrestricted City-Wide Access */}
            {selectedRole === 'supervisor' && (
              <>
                <div className="p-3.5 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">verified_user</span>
                  <div className="text-xs text-on-surface-variant">
                    <p className="font-bold text-primary mb-0.5">City-Wide Supervisor Authority</p>
                    <p>Supervisors hold full command authority over all Ahmedabad police stations, cyber cells, analytics, and officer assignments without location restrictions.</p>
                  </div>
                </div>
                <Field 
                  label="Supervisor Badge ID" 
                  icon="badge" 
                  placeholder="e.g. SUP-AHM-001"
                  register={register('badge_id', { required: "Supervisor Badge ID is required" })} 
                  error={errors.badge_id} 
                />
              </>
            )}

            {/* Citizen Registration: Location / District */}
            {selectedRole === 'citizen' && (
              <Field 
                label="City / District & Residential Area" 
                icon="map" 
                placeholder="e.g. Satellite, Navrangpura, Bopal, Ahmedabad"
                register={register('district', { required: t('forms.required') })} 
                error={errors.district} 
              />
            )}

            <Field label={t('auth.register.password', 'Password')} icon="lock" type={showPass ? 'text' : 'password'} placeholder={t('auth.register.passwordPlaceholder', '••••••••')}
              showToggle onToggle={() => setShowPass(v => !v)} showPass={showPass}
              register={register('password', {
                required: t('forms.required'),
                minLength: { value: 8, message: t('forms.passwordTooShort') },
                validate: v => {
                  if (!/[A-Z]/.test(v)) return t('forms.passwordNeedsUppercase')
                  if (!/[0-9]/.test(v)) return t('forms.passwordNeedsNumber')
                  return true
                }
              })}
              error={errors.password} />

            <Field label={t('auth.register.confirmPassword', 'Confirm Password')} icon="lock_reset" type={showConfirm ? 'text' : 'password'} placeholder={t('auth.register.confirmPlaceholder', '••••••••')}
              showToggle onToggle={() => setShowConfirm(v => !v)} showPass={showConfirm}
              register={register('password_confirm', {
                required: t('forms.required'),
                validate: v => v === watch('password') || t('forms.passwordMismatch'),
              })}
              error={errors.password_confirm} />

            {apiError && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-lg text-error flex-shrink-0 mt-0.5">error</span>
                <p className="text-xs text-error font-mono-data break-all">{apiError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-lg border-none bg-primary text-on-primary font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer hover:brightness-105 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  {t('auth.register.submitting', 'Registering...')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  {t('auth.register.submit', 'Register')}
                </>
              )}
            </button>

            <p className="text-center text-xs text-on-surface-variant mt-2">
              {t('auth.register.alreadyRegistered', 'Already have an account?')}{' '}
              <Link to="/login" className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                {t('auth.register.loginLink', 'Login here')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
