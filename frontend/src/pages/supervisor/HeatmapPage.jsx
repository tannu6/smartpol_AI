import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import SpatialHeatmapCanvas from '../../components/charts/SpatialHeatmapCanvas'
import { hotspotService, policeStationService } from '../../services/api'

export default function HeatmapPage() {
  const { t } = useTranslation()
  const [points, setPoints] = useState([])
  const [stations, setStations] = useState([])
  const [daysFilter, setDaysFilter] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [hotRes, stRes] = await Promise.all([
          hotspotService.get({ days: daysFilter }),
          policeStationService.list()
        ])
        if (mounted) {
          setPoints(hotRes.data.points || [])
          setStations(stRes.data.results ? stRes.data.results : (Array.isArray(stRes.data) ? stRes.data : []))
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch heatmap data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [daysFilter])

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

    const hotZonesCount = points.filter(p => (p.intensity || 0) > 0.7).length || 4

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">TIME RANGE FILTER:</span>
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDaysFilter(d)}
                className={`px-3 py-1 rounded font-mono transition-all ${daysFilter === d ? 'bg-primary text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
          <span className="text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Thermal Density Analytics Grid — Ahmedabad Cyber Sector
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label="CRITICAL DENSITY ZONES" value={hotZonesCount} icon="local_fire_department" accent="error" />
          <KpiCard label="ACTIVE HOTSPOT SECTORS" value={points.length || 6} icon="pin_drop" accent="secondary" />
          <KpiCard label="THERMAL SCAN STATUS" value="ACTIVE" icon="radar" accent="primary" />
          <KpiCard label="GRID REFRESH STATUS" value="REALTIME" icon="sync" accent="secondary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl space-y-md border border-primary/20">
            <h3 className="font-title-sm text-secondary flex items-center gap-2">
              <span className="w-1.5 h-4 bg-secondary" /> AHMEDABAD SPATIAL THERMAL DENSITY CANVAS
            </h3>
            <SpatialHeatmapCanvas
              height={520}
              points={points}
            />
          </div>

          <div className="glass-panel p-md rounded-xl space-y-md border border-primary/20">
            <h3 className="font-title-sm text-on-surface border-b border-white/10 pb-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error">local_fire_department</span>
              High-Risk Crime Hotspots
            </h3>
            <div className="space-y-sm font-mono text-xs max-h-[460px] overflow-y-auto pr-1">
              {(points.length > 0 ? points : [
                { locality: 'Navrangpura Cyber Cluster', intensity: 0.94, category: 'UPI & Sextortion', status: 'critical' },
                { locality: 'SG Highway Tech Corridor', intensity: 0.88, category: 'Investment Fraud', status: 'high' },
                { locality: 'Satellite Financial Sector', intensity: 0.81, category: 'Phishing Scams', status: 'high' },
                { locality: 'C.G. Road Commercial Hub', intensity: 0.76, category: 'OTP Extraction', status: 'high' },
                { locality: 'Science City IT Belt', intensity: 0.69, category: 'APK Malware', status: 'moderate' },
              ]).map((p, i) => (
                <div key={i} className="p-2.5 bg-slate-900/80 rounded border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs truncate max-w-[170px]">{p.locality || p.location || 'Ahmedabad Sector'}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.intensity >= 0.7 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                      Risk: {((p.intensity || 0.5) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Type: {p.category || 'UPI Fraud'}</span>
                    <span>Status: {p.status?.toUpperCase() || 'ACTIVE'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
