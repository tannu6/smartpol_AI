import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { priorityService } from '../../services/api'
import { DataTable } from '../../components/ui/DataTable'

export default function PriorityQueuePage() {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    priorityService.list().then(({ data }) => setQueue(data)).catch(() => setQueue([]))
  }, [])

  return (
    <AppLayout title="SmartPol AI" subtitle="Priority Queue">
      <div className="p-lg space-y-lg">
        <div className="flex items-center gap-sm mb-md">
          <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
          <span className="text-error font-mono-data text-label-caps tracking-[0.2em]">GOLDEN HOUR ACTIVE</span>
        </div>
        <h2 className="font-display-lg-mobile text-primary">Priority Queue</h2>
        <div className="glass-panel rounded-xl overflow-hidden">
          <DataTable
            columns={[
              { key: 'priority', label: 'Priority', render: (r) => (
                <span className={`font-bold ${r.golden_hour ? 'text-error' : 'text-secondary'}`}>P{r.priority}{r.golden_hour ? ' ⚡' : ''}</span>
              )},
              { key: 'complaint', label: 'Case', render: (r) => r.complaint?.complaint_id || '—' },
              { key: 'title', label: 'Title', render: (r) => r.complaint?.title || '—' },
              { key: 'urgency', label: 'Urgency', render: (r) => `${((r.complaint?.urgency_score || 0) * 100).toFixed(0)}%` },
              { key: 'readiness', label: 'Readiness', render: (r) => `${((r.complaint?.readiness_score || 0) * 100).toFixed(0)}%` },
              { key: 'status', label: 'Status', render: (r) => r.status },
            ]}
            data={queue}
          />
        </div>
      </div>
    </AppLayout>
  )
}
