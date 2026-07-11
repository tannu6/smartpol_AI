import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { aiService, suspectService } from '../../services/api'

export default function FusionPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [graph, setGraph] = useState({ nodes: [] })
  useEffect(() => { suspectService.getGraph().then(({ data }) => setGraph(data)).catch(() => {}) }, [])
  const fuse = async () => { if (text.trim()) setResult((await aiService.analyze({ text })).data) }
  return <AppLayout title="SmartPol AI" subtitle="Intelligence Fusion Center"><div className="p-lg space-y-lg">
    <h2 className="font-display-lg-mobile text-primary">Intelligence Fusion Center</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-md"><KpiCard label="Linked Identifiers" value={graph.nodes?.length || 0} icon="hub" /><KpiCard label="Fusion Status" value="ACTIVE" icon="radar" accent="secondary" /><KpiCard label="Data Sources" value="6" icon="dns" accent="primary" /></div>
    <div className="glass-panel p-lg rounded-xl space-y-md"><label className="font-label-caps text-on-surface-variant">Fuse a report</label><textarea value={text} onChange={e => setText(e.target.value)} className="cyber-input w-full p-md min-h-32" placeholder="Paste a complaint or field report to correlate entities..." /><button onClick={fuse} className="px-lg py-sm bg-primary text-on-primary font-bold">RUN FUSION</button>{result && <pre className="overflow-auto bg-surface-container-low p-md text-xs">{JSON.stringify(result.identifier_fusion, null, 2)}</pre>}</div>
  </div></AppLayout>
}
