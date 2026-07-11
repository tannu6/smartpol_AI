import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import SuspectNetworkGraph from '../../components/charts/SuspectNetworkGraph'
import { suspectService } from '../../services/api'
export default function SuspectsPage() { const [graph, setGraph] = useState({ nodes: [], edges: [] }); useEffect(() => { suspectService.getGraph().then(({ data }) => setGraph(data)).catch(() => {}) }, []); return <AppLayout title="SmartPol AI" subtitle="Suspect Relationship Graph"><div className="p-lg space-y-lg"><h2 className="font-display-lg-mobile text-primary">Suspect Relationship Graph</h2><div className="glass-panel p-md rounded-xl overflow-auto"><SuspectNetworkGraph nodes={graph.nodes} edges={graph.edges} /></div></div></AppLayout> }
