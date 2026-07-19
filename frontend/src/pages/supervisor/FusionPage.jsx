import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { aiService, suspectService } from '../../services/api'

export default function FusionPage() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fusing, setFusing] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await suspectService.getGraph()
        if (mounted) setGraph(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch graph data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const fuse = async () => {
    if (!text.trim()) return
    setFusing(true)
    try {
      const res = await aiService.analyze({ text })
      setResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setFusing(false)
    }
  }

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

    const nodesCount = graph?.nodes?.length || 0

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <KpiCard label={t('fusion.linkedIdentifiers')} value={nodesCount} icon="hub" />
          <KpiCard label={t('fusion.fusionStatus')} value="ACTIVE" icon="radar" accent="secondary" />
          <KpiCard label={t('fusion.dataSources')} value="6" icon="dns" accent="primary" />
        </div>
        <div className="glass-panel p-lg rounded-xl space-y-md">
          <label className="font-label-caps text-on-surface-variant">{t('fusion.fuseReport')}</label>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="cyber-input w-full p-md min-h-32 bg-surface/50 border border-outline/20 rounded text-on-surface" 
            placeholder={t('fusion.placeholder')} 
          />
          <button 
            onClick={fuse} 
            disabled={fusing || !text.trim()}
            className="px-lg py-sm bg-primary text-on-primary font-bold rounded flex items-center justify-center disabled:opacity-50"
          >
            {fusing ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin mr-2" /> : null}
            {t('fusion.runFusion')}
          </button>
          {result && (
            <pre className="overflow-auto bg-surface-container-low p-md rounded text-xs text-on-surface mt-4 border border-outline/10">
              {JSON.stringify(result.identifier_fusion || result, null, 2)}
            </pre>
          )}
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('fusion.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('fusion.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
