import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import CrimeHeatmap from '../../components/charts/CrimeHeatmap'
import { analyticsService, secretAgentService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function WarRoomPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [agentMessages, setAgentMessages] = useState([])
  const [replyBody, setReplyBody] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const loadAgentMessages = () => {
    secretAgentService.inbox()
      .then(({ data }) => setAgentMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await analyticsService.get()
        if (mounted) {
          setData(res.data)
          loadAgentMessages()
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to fetch data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const handleSendReply = async () => {
    if (!replyBody.trim()) return
    setSendingReply(true)
    try {
      const firstAgentId = agentMessages[0]?.sender || null
      await secretAgentService.sendMessage({
        body: replyBody,
        recipient_id: firstAgentId
      })
      setReplyBody('')
      loadAgentMessages()
      alert('Directive securely transmitted to field agent.')
    } catch (err) {
      alert('Directive transmission failed.')
    } finally {
      setSendingReply(false)
    }
  }

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
    if (!data) return (
      <div className="p-xl text-center text-on-surface-variant/50">
        <span className="material-symbols-outlined text-5xl mb-md">inbox</span>
        <p>{t('common.noData')}</p>
      </div>
    )

    const points = data.heatmap_points || []
    const totalCrimes = data.daily_trends?.reduce((a, b) => a + b.crimes, 0) || 0
    const alertLevel = totalCrimes > 10 ? 'HIGH' : totalCrimes > 5 ? 'MEDIUM' : 'LOW'
    const alerts = [
      'Gunfire detected — Sector 3',
      'Encryption breach — Level 3',
      'Crowd formation — Plaza Square'
    ]

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <KpiCard label={t('warRoom.threatLevel')} value={alertLevel} icon="warning" accent="error" />
          <KpiCard label={t('warRoom.activeOps')} value={data.officer_performance?.length || 0} icon="hub" accent="secondary" />
          <KpiCard label={t('warRoom.intelFeeds')} value="23" icon="satellite_alt" accent="primary" />
          <KpiCard label={t('warRoom.unitsReady')} value="94%" icon="military_tech" accent="secondary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-secondary mb-md">{t('warRoom.tacticalOverview')}</h3>
            {points.length > 0 ? (
              <CrimeHeatmap points={points} />
            ) : (
              <div className="py-xl text-center text-on-surface-variant/50">
                <span className="material-symbols-outlined text-4xl mb-sm">map</span>
                <p>{t('common.noData')}</p>
              </div>
            )}
          </div>
          <div className="glass-panel p-md rounded-xl space-y-md">
            <h3 className="font-title-sm text-error">{t('warRoom.realTimeAlerts')}</h3>
            {alerts.length > 0 ? alerts.map((a, i) => (
              <div key={i} className="p-sm bg-error/5 border border-error/20 rounded-lg text-sm">
                <span className="w-2 h-2 rounded-full bg-error inline-block mr-sm animate-pulse" />
                {a}
              </div>
            )) : (
              <p className="text-on-surface-variant/50 text-center py-md">{t('common.noData')}</p>
            )}
          </div>
        </div>

        {/* Encrypted Agent Transmissions section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl space-y-md">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-md">
              <span className="w-1 h-4 bg-error" /> Encrypted Agent Transmissions
            </h3>
            
            {agentMessages.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant font-mono-data border border-dashed border-primary/20 rounded-xl">
                No active secure channels established.
              </div>
            ) : (
              <div className="space-y-sm max-h-[300px] overflow-y-auto pr-sm">
                {agentMessages.map((m, i) => {
                  const isOutgoing = m.sender === user?.id
                  return (
                    <div key={m.id || i} className={`p-md rounded border text-xs space-y-sm ${isOutgoing ? 'bg-secondary/5 border-secondary/30' : (m.is_urgent ? 'bg-error/5 border-error/30' : 'bg-surface-container-high border-outline-variant')}`}>
                      <div className="flex justify-between font-mono-data">
                        <span className={`font-bold ${isOutgoing ? 'text-secondary' : 'text-primary'}`}>
                          {isOutgoing ? 'HQ DIRECTIVE (SENT)' : `AGENT REF: ${m.sender_name || 'SECRET_AGENT'}`}
                        </span>
                        <span className="text-on-surface-variant">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-on-surface-variant font-mono-data">{m.body}</p>
                      {m.is_duress && (
                        <span className="text-[10px] bg-error text-on-error font-bold px-2 py-0.5 rounded tracking-widest animate-pulse">
                          DURESS TRIGGERED
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="glass-panel p-md rounded-xl flex flex-col justify-between">
            <h3 className="font-title-sm text-on-surface flex items-center gap-sm mb-md">
              <span className="w-1 h-4 bg-primary" /> Command HQ Reply Portal
            </h3>
            <div className="space-y-sm flex-1 flex flex-col">
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm text-xs font-mono-data placeholder:text-outline focus:outline-none focus:border-primary flex-1 h-24"
                placeholder="Type encrypted message back to field agent..."
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
              />
              <button 
                onClick={handleSendReply}
                disabled={!replyBody.trim() || sendingReply}
                className="w-full py-sm bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-50"
              >
                {sendingReply ? 'TRANSMITTING...' : 'SEND SECURE DIRECTIVE'}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <AppLayout title={t('common.appTitle')} subtitle={t('warRoom.subtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('warRoom.title')}</h2>
        {renderContent()}
      </div>
    </AppLayout>
  )
}
