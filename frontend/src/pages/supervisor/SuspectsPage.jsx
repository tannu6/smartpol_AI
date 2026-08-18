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

  // Default demonstration suspect network data
  const defaultNetwork = {
    nodes: [
      { node_id: 'SUS-01', name: 'Rajesh Kumar (Mule Kingpin)', node_type: 'person', risk_score: 0.95 },
      { node_id: 'SUS-02', name: 'Vikram Singh (OPERATOR)', node_type: 'person', risk_score: 0.88 },
      { node_id: 'ACC-9901', name: 'A/C 990188231 (SBI)', node_type: 'account', risk_score: 0.92 },
      { node_id: 'ACC-8802', name: 'A/C 880211490 (HDFC)', node_type: 'account', risk_score: 0.85 },
      { node_id: 'PH-9821', name: '+91 98210-99482', node_type: 'phone', risk_score: 0.78 },
      { node_id: 'DOM-PHISH', name: 'secure-sbi-update.com', node_type: 'domain', risk_score: 0.96 },
      { node_id: 'CASE-101', name: 'CP-19922743 (UPI Scam)', node_type: 'person', risk_score: 0.80 },
    ],
    edges: [
      { source: 'SUS-01', target: 'ACC-9901', relationship: 'controls_mule', weight: 1.5 },
      { source: 'SUS-01', target: 'SUS-02', relationship: 'accomplice', weight: 1.2 },
      { source: 'SUS-02', target: 'PH-9821', relationship: 'uses_phone', weight: 1.0 },
      { source: 'PH-9821', target: 'DOM-PHISH', relationship: 'linked_domain', weight: 1.8 },
      { source: 'DOM-PHISH', target: 'ACC-8802', relationship: 'funnels_money', weight: 1.6 },
      { source: 'CASE-101', target: 'DOM-PHISH', relationship: 'victim_hit', weight: 1.4 },
      { source: 'CASE-101', target: 'ACC-9901', relationship: 'money_sent', weight: 1.7 },
    ]
  }

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await suspectService.getGraph()
        if (mounted) {
          setGraph(data || { nodes: [], edges: [] })
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load network intelligence')
          setGraph({ nodes: [], edges: [] })
        }
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

    const activeNodes = graph?.nodes || []
    const activeEdges = graph?.edges || []

    if (!activeNodes || activeNodes.length === 0) {
      return (
        <div className="glass-panel p-xl rounded-xl text-center space-y-md border border-primary/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">hub</span>
          <h3 className="text-lg font-bold text-on-surface">No Connected Intelligence Found</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto font-mono">
            No connected intelligence found for this case. File new complaints or extract suspicious entities to populate the relationship graph.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-md">
        <div className="flex flex-wrap items-center justify-between gap-md p-md rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div><span className="text-slate-400 block text-[10px]">TOTAL NODES</span><span className="font-bold text-primary text-sm">{activeNodes.length}</span></div>
            <div><span className="text-slate-400 block text-[10px]">LINKED RELATIONSHIPS</span><span className="font-bold text-secondary text-sm">{activeEdges.length}</span></div>
            <div><span className="text-slate-400 block text-[10px]">HIGH RISK NODES</span><span className="font-bold text-red-400 text-sm">{activeNodes.filter(n => (n.risk_score || 0) >= 0.85).length}</span></div>
          </div>
          <span className="px-3 py-1 bg-secondary/10 border border-secondary/30 text-secondary rounded font-bold">
            Live D3 Network Physics Engine
          </span>
        </div>

        <div className="glass-panel p-md rounded-xl overflow-auto min-h-[520px] border border-primary/20">
          <SuspectNetworkGraph nodes={activeNodes} edges={activeEdges} height={520} />
        </div>
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
