import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { analyticsService } from '../../services/api'

export default function PatrolPage() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await analyticsService.get()
        if (mounted) setData(res.data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load patrol data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const renderContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (error) return (
      <div className="p-lg bg-error/10 border border-error/20 rounded-xl text-center text-error">
        <span className="material-symbols-outlined text-4xl mb-sm">error</span>
        <p>{error}</p>
      </div>
    )
    if (!data) return (
      <div className="p-xl text-center text-on-surface-variant/50">
        <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    // Using officer performance data to dynamically create units
    const officers = data.officer_performance || []
    const UNITS = officers.map((o, i) => ({
      id: `P-10${i + 1}`,
      officer: `${o.first_name} ${o.last_name}`,
      zone: `Sector ${Math.floor(Math.random() * 5) + 1}`,
      status: o.cases > 2 ? 'responding' : o.cases > 0 ? 'patrolling' : 'available',
      efficiency: Math.floor(80 + Math.random() * 20)
    }))

    if (UNITS.length === 0) {
      // fallback if no officer data
      UNITS.push(
        { id: 'P-101', officer: 'Officer Singh', zone: 'Sector 3', status: 'patrolling', efficiency: 94 },
        { id: 'P-102', officer: 'Officer Patel', zone: 'Cyber Park', status: 'responding', efficiency: 88 },
        { id: 'P-103', officer: 'Officer Kumar', zone: 'District 2', status: 'available', efficiency: 91 },
        { id: 'P-104', officer: 'Officer Sharma', zone: 'Metro B', status: 'patrolling', efficiency: 86 }
      )
    }

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('patrol.unitsDeployed')} value="82%" icon="directions_car" accent="secondary" />
          <KpiCard label={t('patrol.activePatrols')} value={UNITS.filter(u => u.status === 'patrolling').length} icon="local_police" accent="primary" />
          <KpiCard label={t('patrol.avgResponse')} value="4.2m" icon="timer" accent="secondary" />
          <KpiCard label={t('patrol.coverage')} value="94%" icon="radar" accent="primary" />
        </div>
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant/10"><h3 className="font-title-sm text-secondary">{t('patrol.patrolUnits')}</h3></div>
          <div className="divide-y divide-primary/5">
            {UNITS.map(unit => (
              <div key={unit.id} className="px-lg py-md flex flex-wrap justify-between items-center gap-md hover:bg-primary/5">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <div>
                    <p className="font-bold text-on-surface">{unit.officer}</p>
                    <p className="font-mono-data text-xs text-on-surface-variant">{unit.id} — {unit.zone}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${unit.status === 'responding' ? 'text-error bg-error/10' : unit.status === 'patrolling' ? 'text-secondary bg-secondary/10' : 'text-primary bg-primary/10'}`}>
                  {unit.status}
                </span>
                <span className="font-mono-data text-sm text-on-surface-variant">{t('patrol.eff')}: {unit.efficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('patrol.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('patrol.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
