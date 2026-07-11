import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { complaintService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    complaintService.list().then(({ data }) => {
      setComplaints(Array.isArray(data) ? data : data.results || [])
    }).finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'complaint_id', label: 'ID', render: (r) => <span className="font-mono-data text-secondary">{r.complaint_id}</span> },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${r.status === 'resolved' ? 'text-secondary bg-secondary/10' : r.status === 'investigating' ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>{r.status}</span>
    )},
    { key: 'urgency_score', label: 'Urgency', render: (r) => `${(r.urgency_score * 100).toFixed(0)}%` },
    { key: 'actions', label: '', render: (r) => <Link to={`/citizen/timeline/${r.id}`} className="text-primary text-xs hover:text-secondary">Timeline →</Link> },
  ]

  return (
    <AppLayout title="SmartPol AI" subtitle="My Complaints">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">My Complaints</h2>
        {loading ? (
          <p className="font-mono-data text-on-surface-variant animate-pulse">Loading...</p>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden">
            <DataTable columns={columns} data={complaints} />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
