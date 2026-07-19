import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import SuspectNetworkGraph from '../../components/charts/SuspectNetworkGraph'
import { suspectService } from '../../services/api'

export default function SuspectsPage() {
  const { t } = useTranslation()
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await suspectService.getGraph()
        if (mounted) setGraph(data || { nodes: [], edges: [] })
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch suspect graph')
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
    if (!graph || graph.nodes?.length === 0) return (
      <div className="p-xl text-center text-on-surface-variant/50">
        <span className="material-symbols-outlined text-5xl mb-md">group_off</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    return (
      <div className="glass-panel p-md rounded-xl overflow-auto min-h-[500px]">
        <SuspectNetworkGraph nodes={graph.nodes} edges={graph.edges} />
      </div>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('suspects.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('suspects.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
