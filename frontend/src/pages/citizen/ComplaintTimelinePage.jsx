import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { complaintService } from '../../services/api'

export default function ComplaintTimelinePage() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)

  useEffect(() => {
    if (id) {
      complaintService.get(id).then(({ data }) => setComplaint(data))
    } else {
      complaintService.list().then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || []
        if (list[0]) complaintService.get(list[0].id).then(({ data: c }) => setComplaint(c))
      })
    }
  }, [id])

  return (
    <AppLayout title="SmartPol AI" subtitle="Investigation Pulse">
      <div className="p-lg space-y-lg max-w-3xl mx-auto">
        <div>
          <h2 className="font-display-lg-mobile text-primary">Complaint Timeline</h2>
          {complaint && <p className="font-mono-data text-secondary">{complaint.complaint_id} — {complaint.title}</p>}
        </div>
        <div className="glass-panel rounded-xl p-lg">
          <div className="flex items-center gap-md mb-lg">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${complaint?.status === 'resolved' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
              {complaint?.status?.toUpperCase()}
            </span>
            <span className="font-mono-data text-on-surface-variant">Urgency: {complaint ? (complaint.urgency_score * 100).toFixed(0) : 0}%</span>
            <span className="font-mono-data text-on-surface-variant">QR: {complaint?.qr_code}</span>
          </div>
          <div className="space-y-lg relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-outline-variant/15" />
            {(complaint?.timeline || []).map((event, i) => (
              <div key={i} className="relative flex gap-md pl-0">
                <div className={`mt-1 w-4 h-4 rounded-full z-10 ${i === 0 ? 'bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]' : 'bg-primary'}`} />
                <div className="flex-1 pb-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-on-surface">{event.event}</span>
                    <span className="text-[10px] font-mono-data text-on-surface-variant">{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{event.description}</p>
                  {event.actor_name && <p className="text-[10px] text-primary mt-1">— {event.actor_name}</p>}
                </div>
              </div>
            ))}
            {!complaint?.timeline?.length && (
              <p className="text-on-surface-variant font-mono-data">No timeline events yet.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
