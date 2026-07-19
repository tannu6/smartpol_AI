import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DailyTrendChart, OfficerPerformanceChart, CategoryPieChart } from '../../components/charts/Charts'
import { analyticsService } from '../../services/api'

export default function AnalyticsPage() {
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
        if (mounted) setError(err.message || 'Failed to load analytics data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }
    if (error) {
      return (
        <div className="p-lg bg-error/10 border border-error/20 rounded-xl text-center text-error">
          <span className="material-symbols-outlined text-4xl mb-sm">error</span>
          <p>{error}</p>
        </div>
      )
    }
    if (!data) {
      return (
        <div className="p-xl text-center text-on-surface-variant/50">
          <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
          <p>{t('common.noData')}</p>
        </div>
      )
    }

    const officerData = (data.officer_performance || []).map(o => ({
      name: `${o.first_name} ${o.last_name?.[0] || ''}.`.trim(),
      cases: o.cases,
    }))

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <KpiCard label={t('analytics.totalCases')} value={data.daily_trends?.reduce((a, b) => a + b.crimes, 0) || 0} icon="analytics" accent="primary" />
          <KpiCard label={t('analytics.avgUrgency')} value={`${((data.avg_urgency || 0) * 100).toFixed(0)}%`} icon="speed" accent="error" />
          <KpiCard label={t('analytics.officersActive')} value={data.officer_performance?.length || 0} icon="badge" accent="secondary" />
          <KpiCard label={t('analytics.scamClusters')} value={data.categories?.length || 0} icon="biotech" accent="primary" />
        </div>

        {(data.daily_trends?.length === 0 && data.categories?.length === 0) ? (
          <div className="p-xl text-center text-on-surface-variant/50">
            <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="glass-panel p-lg rounded-xl">
              <h3 className="font-title-sm text-on-surface mb-lg flex items-center gap-sm"><span className="w-1 h-4 bg-secondary" /> {t('analytics.crimeTrends')}</h3>
              {data.daily_trends?.length > 0 ? (
                <DailyTrendChart data={data.daily_trends} />
              ) : (
                <p className="text-center text-on-surface-variant/50 py-lg">{t('common.noData')}</p>
              )}
            </div>
            <div className="glass-panel p-lg rounded-xl">
              <h3 className="font-title-sm text-on-surface mb-lg flex items-center gap-sm"><span className="w-1 h-4 bg-primary" /> {t('analytics.categoryDistribution')}</h3>
              {data.categories?.length > 0 ? (
                <CategoryPieChart data={data.categories.map(c => ({ name: c.category, value: c.count }))} />
              ) : (
                <p className="text-center text-on-surface-variant/50 py-lg">{t('common.noData')}</p>
              )}
            </div>
          </div>
        )}

        <div className="glass-panel p-lg rounded-xl">
          <h3 className="font-title-sm text-on-surface mb-lg">{t('analytics.officerPerformance')}</h3>
          {officerData.length > 0 ? (
            <OfficerPerformanceChart data={officerData} />
          ) : (
             <p className="text-center text-on-surface-variant/50 py-lg">{t('common.noData')}</p>
          )}
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('analytics.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg text-primary uppercase tracking-tighter">{t('analytics.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
