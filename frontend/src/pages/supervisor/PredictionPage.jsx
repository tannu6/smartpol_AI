import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { DailyTrendChart } from '../../components/charts/Charts'
import { analyticsService, predictionService } from '../../services/api'

export default function PredictionPage() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [predictionData, setPredictionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [aRes, pRes] = await Promise.all([
          analyticsService.get(),
          predictionService.get()
        ])
        if (mounted) {
          setData(aRes.data)
          setPredictionData(pRes.data)
        }
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

    const predictions = predictionData?.predictions || []
    const trends = data.daily_trends || []

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('prediction.modelAccuracy')} value={predictionData?.model_accuracy || "92.4%"} icon="analytics" accent="primary" />
          <KpiCard label={t('prediction.highRiskZones')} value={predictions.filter(p => p.risk > 70).length} icon="warning" accent="error" />
          <KpiCard label={t('prediction.predictions')} value={predictions.length} icon="auto_graph" accent="secondary" />
          <KpiCard label={t('prediction.horizon')} value={predictionData?.horizon || "48h"} icon="schedule" accent="primary" />
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
          <div className="glass-panel p-lg rounded-xl space-y-md border border-primary/20">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-title-sm text-error">{t('prediction.predictedIncidents')}</h3>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {predictionData?.label || 'AI-Assisted Risk Forecast'}
              </span>
            </div>
            {predictions.length > 0 ? predictions.map((p, i) => (
              <div key={i} className="p-md bg-surface-container-low/50 rounded-lg border border-primary/10 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">{p.zone}</span>
                  <span className="font-mono-data text-error font-bold">{p.risk}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-error" style={{ width: `${p.risk}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant font-mono pt-1">
                  <span>{p.type} — {p.window}</span>
                  <span className="text-secondary">Conf: {p.confidence || '90%'}</span>
                </div>
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
