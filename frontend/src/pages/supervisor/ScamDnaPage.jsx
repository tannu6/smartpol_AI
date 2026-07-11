import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { DataTable } from '../../components/ui/DataTable'
import { scamDnaService } from '../../services/api'
export default function ScamDnaPage() { const [items, setItems] = useState([]); useEffect(() => { scamDnaService.list().then(({ data }) => setItems(data)).catch(() => {}) }, []); return <AppLayout title="SmartPol AI" subtitle="Scam DNA Laboratory"><div className="p-lg space-y-lg"><h2 className="font-display-lg-mobile text-primary">Scam DNA Laboratory</h2><div className="glass-panel p-md rounded-xl"><DataTable data={items} columns={[{ key: 'pattern_id', label: 'Pattern ID' }, { key: 'name', label: 'Scam Family' }, { key: 'category', label: 'Category' }, { key: 'linked_cases', label: 'Linked Cases' }, { key: 'confidence', label: 'Confidence', render: r => `${Math.round(r.confidence * 100)}%` }]} /></div></div></AppLayout> }
