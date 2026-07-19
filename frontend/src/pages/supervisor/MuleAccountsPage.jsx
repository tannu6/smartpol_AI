import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { DataTable } from '../../components/ui/DataTable'
import { muleService } from '../../services/api'

export default function MuleAccountsPage() {
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
        const { data } = await muleService.list()
        if (mounted) setItems(data || [])
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch mule accounts data')
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
        <span className="material-symbols-outlined text-5xl mb-md">account_balance</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    const columns = [
      { key: 'account_id', label: t('mule.colAccount') },
      { key: 'bank_name', label: t('mule.colBank') },
      { key: 'transaction_count', label: t('mule.colTransactions') },
      { key: 'total_amount', label: t('mule.colExposure') },
      { key: 'risk_level', label: t('mule.colRisk'), render: r => <span className={`font-bold uppercase ${r.risk_level === 'critical' || r.risk_level === 'high' ? 'text-error' : r.risk_level === 'medium' ? 'text-secondary' : 'text-primary'}`}>{r.risk_level}</span> },
      { key: 'explanation', label: 'AI Reasoning', render: r => (
          <div className="flex flex-col gap-1 min-w-[200px] max-w-sm">
            <span className="text-xs text-on-surface-variant break-words leading-tight">{r.ai_analysis?.explanation || "Awaiting analysis..."}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {r.ai_analysis?.indicators?.map((ind, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-primary/20 text-primary border border-primary/30">{ind.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
      )},
      { key: 'status', label: t('mule.colStatus') }
    ]

    return (
      <div className="glass-panel p-md rounded-xl">
        <DataTable data={items} columns={columns} />
      </div>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('mule.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('mule.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
