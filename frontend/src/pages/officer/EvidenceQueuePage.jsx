import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { evidenceService } from '../../services/api'

export default function EvidenceQueuePage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    evidenceService.list().then(({ data }) => setItems(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  return (
    <AppLayout title="SmartPol AI" subtitle="Evidence Queue">
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">Evidence Queue</h2>
        <div className="space-y-md">
          {items.length === 0 && (
            <div className="glass-panel p-lg rounded-xl text-center text-on-surface-variant">No evidence pending review.</div>
          )}
          {items.map(item => (
            <div key={item.id} className="glass-panel p-md rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">{item.file_type === 'video' ? 'videocam' : item.file_type === 'image' ? 'image' : 'description'}</span>
                <div>
                  <p className="font-bold text-on-surface">{item.file_name}</p>
                  <p className="font-mono-data text-xs text-on-surface-variant">HASH: {item.hash_value?.slice(0, 16)}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded text-primary bg-primary/10">
                PENDING REVIEW
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
