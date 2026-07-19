import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DailyTrendChart } from '../../components/charts/Charts'
import { analyticsService } from '../../services/api'

export default function PredictionPage() {
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
        if (mounted) setError(err.message || 'Failed to load predictions')
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

    const PREDICTIONS = [
      { zone: 'Cyber Park Dr.', risk: 92, type: 'Cyber Fraud', window: 'Next 6h' },
      { zone: 'Metro Station B', risk: 78, type: 'Theft', window: 'Next 12h' },
      { zone: 'District 2 Vault', risk: 65, type: 'Scam Cluster', window: 'Next 24h' },
      { zone: 'Outer Rim Apts.', risk: 45, type: 'Harassment', window: 'Next 48h' },
    ]

    const trends = data.daily_trends || []

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('prediction.modelAccuracy')} value="94.8%" icon="analytics" accent="primary" />
          <KpiCard label={t('prediction.highRiskZones')} value={PREDICTIONS.filter(p => p.risk > 70).length} icon="warning" accent="error" />
          <KpiCard label={t('prediction.predictions')} value={PREDICTIONS.length} icon="auto_graph" accent="secondary" />
          <KpiCard label={t('prediction.horizon')} value="48h" icon="schedule" accent="primary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="glass-panel p-lg rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-lg">{t('prediction.historicalBaseline')}</h3>
            {trends.length > 0 ? (
               <DailyTrendChart data={trends} />
            ) : (
               <div className="py-xl text-center text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-4xl mb-sm">show_chart</span>
                  <p>{t('common.noData')}</p>
               </div>
            )}
          </div>
          <div className="glass-panel p-lg rounded-xl space-y-md">
            <h3 className="font-title-sm text-error mb-md">{t('prediction.predictedIncidents')}</h3>
            {PREDICTIONS.length > 0 ? PREDICTIONS.map((p, i) => (
              <div key={i} className="p-md bg-surface-container-low/50 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center mb-sm">
                  <span className="font-bold text-on-surface">{p.zone}</span>
                  <span className="font-mono-data text-error">{p.risk}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-sm">
                  <div className="h-full bg-error" style={{ width: `${p.risk}%` }} />
                </div>
                <p className="text-xs text-on-surface-variant">{p.type} — {p.window}</p>
              </div>
            )) : (
               <p className="text-on-surface-variant/50 text-center py-md">{t('common.noData')}</p>
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('prediction.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('prediction.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
