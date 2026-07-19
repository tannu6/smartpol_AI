import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { DataTable } from '../../components/ui/DataTable'
import { scamDnaService } from '../../services/api'

export default function ScamDnaPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await scamDnaService.list()
        if (mounted) setItems(data || [])
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch Scam DNA data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const renderContent = () => {
    if (loading) return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (error) return (
      <div className="p-lg bg-error/10 border border-error/20 rounded-xl text-center text-error">
        <span className="material-symbols-outlined text-4xl mb-sm">error</span>
        <p>{error}</p>
      </div>
    )
    if (items.length === 0) return (
      <div className="p-xl text-center text-on-surface-variant/50">
        <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    const columns = [
      { key: 'pattern_id', label: t('scamDna.colPatternId') },
      { key: 'name', label: t('scamDna.colName') },
      { key: 'category', label: t('scamDna.colCategory') },
      { key: 'linked_cases', label: t('scamDna.colLinkedCases') },
      { key: 'confidence', label: t('scamDna.colConfidence'), render: r => `${Math.round((r.confidence || 0) * 100)}%` }
    ]

    return (
      <div className="glass-panel p-md rounded-xl">
        <DataTable data={items} columns={columns} />
      </div>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('scamDna.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('scamDna.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
