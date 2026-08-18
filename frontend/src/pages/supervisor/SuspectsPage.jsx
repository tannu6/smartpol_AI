import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import SuspectNetworkGraph from '../../components/charts/SuspectNetworkGraph'
import { suspectService } from '../../services/api'
import apiClient from '../../services/api/client'
import toast from 'react-hot-toast'

export default function SuspectsPage() {
  const { t } = useTranslation()
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hops, setHops] = useState(2)

  // Shortest Path Modal State
  const [isPathModalOpen, setIsPathModalOpen] = useState(false)
  const [sourceNode, setSourceNode] = useState('')
  const [targetNode, setTargetNode] = useState('')
  const [pathResult, setPathResult] = useState(null)
  const [searchingPath, setSearchingPath] = useState(false)

  const fetchGraphData = async (selectedHops = hops) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.get('/suspect-graph/', { params: { hops: selectedHops } })
      setGraph(data || { nodes: [], edges: [] })
    } catch (err) {
      setError(err.message || 'Failed to load network intelligence')
      setGraph({ nodes: [], edges: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGraphData(hops)
  }, [hops])

  const handleFindShortestPath = async (e) => {
    e.preventDefault()
    if (!sourceNode || !targetNode) {
      toast.error('Select both source and target node ID.')
      return
    }
    setSearchingPath(true)
    try {
      const { data } = await apiClient.get('/suspect-graph/shortest-path/', {
        params: { source: sourceNode, target: targetNode }
      })
      setPathResult(data)
      if (!data.path_found) {
        toast.error(`No connected path found between ${sourceNode} and ${targetNode}.`)
      } else {
        toast.success(`Shortest path found! Distance: ${data.distance} hop(s).`)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to calculate shortest path.')
    } finally {
      setSearchingPath(false)
    }
  }

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
        {/* Controls & Metrics Header */}
        <div className="flex flex-wrap items-center justify-between gap-md p-md rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div><span className="text-slate-400 block text-[10px]">TOTAL NODES</span><span className="font-bold text-primary text-sm">{activeNodes.length}</span></div>
            <div><span className="text-slate-400 block text-[10px]">LINKED RELATIONSHIPS</span><span className="font-bold text-secondary text-sm">{activeEdges.length}</span></div>
            <div><span className="text-slate-400 block text-[10px]">HIGH RISK NODES</span><span className="font-bold text-red-400 text-sm">{activeNodes.filter(n => (n.risk_score || 0) >= 0.85).length}</span></div>
          </div>

          {/* Hops Expansion Filter & Shortest Path Trigger */}
          <div className="flex items-center gap-sm">
            <div className="flex bg-slate-950 rounded border border-white/10 p-0.5">
              {[1, 2, 3].map(h => (
                <button
                  key={h}
                  onClick={() => setHops(h)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    hops === h ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h}-Hop BFS
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPathModalOpen(true)}
              className="px-3 py-1 bg-secondary text-black font-bold text-xs uppercase rounded hover:brightness-110 cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">route</span> Find Path
            </button>
          </div>
        </div>

        {/* Provenance Badge Legend */}
        <div className="flex items-center gap-md text-[10px] font-mono px-md py-1 bg-slate-950/60 rounded border border-white/5">
          <span className="text-slate-400 font-bold uppercase">Data Provenance Badges:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VERIFIED</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">REPORTED</span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AI_INFERRED</span>
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">DISMISSED</span>
        </div>

        {/* D3 Graph Render */}
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

      {/* Shortest Path Search Modal */}
      {isPathModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-secondary/40 rounded-xl w-full max-w-xl p-6 space-y-4 font-mono text-xs text-white shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">route</span>
                <h3 className="font-bold text-secondary text-sm tracking-wide">BFS SHORTEST PATH INTELLIGENCE SEARCH</h3>
              </div>
              <button onClick={() => setIsPathModalOpen(false)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleFindShortestPath} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-slate-300 font-bold text-[11px] uppercase">SOURCE NODE ID</label>
                <select
                  value={sourceNode}
                  onChange={e => setSourceNode(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">-- Select Source Node --</option>
                  {(graph?.nodes || []).map(n => (
                    <option key={n.node_id} value={n.node_id}>{n.node_id} — {n.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-bold text-[11px] uppercase">TARGET NODE ID</label>
                <select
                  value={targetNode}
                  onChange={e => setTargetNode(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">-- Select Target Node --</option>
                  {(graph?.nodes || []).map(n => (
                    <option key={n.node_id} value={n.node_id}>{n.node_id} — {n.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsPathModalOpen(false)} className="px-4 py-2 border border-white/20 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={searchingPath || !sourceNode || !targetNode} className="px-4 py-2 bg-secondary text-black font-bold uppercase rounded-lg hover:brightness-110 cursor-pointer disabled:opacity-50 transition-all shadow-md">
                  {searchingPath ? 'Calculating...' : 'Calculate Path'}
                </button>
              </div>
            </form>

            {pathResult && pathResult.path_found && (
              <div className="p-4 bg-slate-950 rounded-lg border border-emerald-500/40 space-y-2 mt-4">
                <div className="flex justify-between text-emerald-400 font-bold text-xs border-b border-emerald-500/20 pb-2">
                  <span>Path Traversal Complete</span>
                  <span>Distance: {pathResult.distance} hop(s)</span>
                </div>
                <div className="space-y-1.5 text-slate-200 text-xs pt-1">
                  {pathResult.nodes.map((n, i) => (
                    <div key={n.node_id} className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-white/5">
                      <span className="w-5 text-slate-400 font-bold">{i + 1}.</span>
                      <span className="font-bold text-white font-mono">{n.node_id}</span>
                      <span className="text-slate-300">({n.name})</span>
                      <span className="text-[10px] px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded font-bold ml-auto">{n.node_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
