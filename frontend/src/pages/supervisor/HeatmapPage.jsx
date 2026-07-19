import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import CrimeHeatmap from '../../components/charts/CrimeHeatmap'
import { analyticsService } from '../../services/api'

export default function HeatmapPage() {
  const { t } = useTranslation()
  const [points, setPoints] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await analyticsService.get()
        if (mounted) setPoints(data.heatmap_points || [])
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch heatmap data')
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
    if (!points) return (
      <div className="p-xl text-center text-on-surface-variant/50">
        <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    const hotZonesCount = points.filter(p => p.intensity > 0.7).length

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('heatmap.hotZones')} value={hotZonesCount} icon="local_fire_department" accent="error" />
          <KpiCard label={t('heatmap.dataPoints')} value={points.length} icon="pin_drop" accent="secondary" />
          <KpiCard label={t('heatmap.coverage')} value="Sector 7G" icon="map" accent="primary" />
          <KpiCard label={t('heatmap.refresh')} value="LIVE" icon="sync" accent="secondary" />
        </div>
        <div className="glass-panel p-md rounded-xl">
          <h3 className="font-title-sm text-secondary mb-md">{t('heatmap.tacticalDensity')}</h3>
          {points.length > 0 ? (
            <CrimeHeatmap points={points} />
          ) : (
            <div className="py-xl text-center text-on-surface-variant/50">
              <span className="material-symbols-outlined text-5xl mb-md">map</span>
              <p>{t('common.noData')}</p>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('heatmap.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('heatmap.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
