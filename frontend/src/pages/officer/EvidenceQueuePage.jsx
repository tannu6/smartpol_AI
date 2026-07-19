import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { evidenceService } from '../../services/api'
import { useTranslation } from 'react-i18next'

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
            <div className="space-y-md w-full">
              {items.map(item => (
                <div key={item.id} className="glass-panel p-md rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-primary">{item.file_type === 'video' ? 'videocam' : item.file_type === 'image' ? 'image' : 'description'}</span>
                    <div>
                      <p className="font-bold text-on-surface">{item.file_name}</p>
                      <p className="font-mono-data text-xs text-on-surface-variant">{t('evidenceQueue.hashLabel')} {item.hash_value?.slice(0, 16)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded text-primary bg-primary/10">
                    {t('evidenceQueue.pendingReview')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
