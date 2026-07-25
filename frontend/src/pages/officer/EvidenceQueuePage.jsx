import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { evidenceService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import { DataTable, TableSection } from '../../components/ui/DataTable'

export default function EvidenceQueuePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    evidenceService.list()
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'file_name', label: 'File Name', render: r => (
      <div className="flex items-center gap-sm font-bold text-on-surface">
        <span className="material-symbols-outlined text-primary text-base">
          {r.file_type === 'video' ? 'videocam' : r.file_type === 'image' ? 'image' : 'description'}
        </span>
        <span className="truncate max-w-[200px]" title={r.file_name}>{r.file_name}</span>
      </div>
    )},
    { key: 'complaint_code', label: 'Associated Case ID', render: r => (
      <span className="font-mono-data text-secondary">{r.complaint_code || 'CP-GENERIC'}</span>
    )},
    { key: 'file_type', label: 'Type', render: r => (
      <span className="text-[10px] font-mono-data font-bold tracking-widest px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
        {r.file_type?.toUpperCase()}
      </span>
    )},
    { key: 'hash_value', label: 'SHA-256 Checksum', render: r => (
      <div className="flex items-center gap-md bg-surface-container-lowest border border-outline-variant px-sm py-1 rounded max-w-xs justify-between">
        <span className="font-mono text-xs text-on-surface-variant font-mono-data truncate max-w-[150px]" title={r.hash_value}>
          {r.hash_value ? `${r.hash_value.slice(0, 14)}...${r.hash_value.slice(-8)}` : 'UNKNOWN'}
        </span>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(r.hash_value);
            alert('Hash copied to clipboard');
          }}
          className="text-primary hover:text-secondary flex items-center cursor-pointer text-[10px] font-bold"
        >
          <span className="material-symbols-outlined text-xs">content_copy</span> COPY
        </button>
      </div>
    )},
    { key: 'created_at', label: 'Uploaded Date', render: r => (
      <span className="text-xs font-mono-data text-on-surface-variant">
        {new Date(r.created_at).toLocaleDateString()}
      </span>
    )},
    { key: 'action', label: 'Actions', render: r => (
      <a 
        href={r.file} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs text-secondary hover:text-white transition-colors font-bold uppercase flex items-center gap-1 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">download</span> Retrieve
      </a>
    )}
  ]

  return (
    <AppLayout title={t('evidenceQueue.appTitle')} subtitle={t('evidenceQueue.appSubtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('evidenceQueue.title')}</h2>
        <div className="space-y-md min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-xl h-full gap-4">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
              <p className="font-mono-data text-primary animate-pulse">{t('common.loading', 'Decrypting Evidence Vault...')}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="glass-panel p-xl rounded-xl flex flex-col items-center justify-center gap-4 border border-dashed border-primary/30">
              <span className="material-symbols-outlined text-6xl text-primary/30">folder_off</span>
              <h3 className="font-title-sm text-primary">{t('evidenceQueue.noEvidence', 'Vault Empty')}</h3>
              <p className="text-on-surface-variant text-center max-w-sm">No new evidence has been uploaded for your assigned cases.</p>
            </div>
          ) : (
            <TableSection title="Vault Items" badge={`${items.length} Files`}>
              <DataTable columns={columns} data={items} />
            </TableSection>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
