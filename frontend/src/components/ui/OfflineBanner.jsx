import { useState, useEffect } from 'react'
import { getPendingOfflineActions, replayOfflineQueue } from '../../utils/offlineQueue'
import apiClient from '../../services/api/client'
import toast from 'react-hot-toast'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, complete, failed

  const checkPending = async () => {
    try {
      const actions = await getPendingOfflineActions()
      setPendingCount(actions.length)
    } catch {
      setPendingCount(0)
    }
  }

  const handleSync = async () => {
    setSyncStatus('syncing')
    try {
      const result = await replayOfflineQueue(apiClient)
      await checkPending()
      if (result.failed > 0) {
        setSyncStatus('failed')
        toast.error(`Sync finished: ${result.success} synced, ${result.failed} failed.`)
      } else {
        setSyncStatus('complete')
        toast.success(`Sync complete! ${result.success} actions synced.`)
        setTimeout(() => setSyncStatus('idle'), 4000)
      }
    } catch {
      setSyncStatus('failed')
      toast.error('Sync failed — retry')
    }
  }

  useEffect(() => {
    checkPending()
    const interval = setInterval(checkPending, 3000)

    const onOnline = () => {
      setOnline(true)
      handleSync()
    }
    const onOffline = () => {
      setOnline(false)
      setSyncStatus('idle')
      checkPending()
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (online && pendingCount === 0 && syncStatus === 'idle') return null

  return (
    <div className={`fixed top-16 left-0 right-0 z-[60] text-center text-xs font-mono font-bold py-2.5 px-4 md:pl-[280px] shadow-lg flex items-center justify-center gap-3 transition-all ${
      !online ? 'bg-amber-950 text-amber-300 border-b border-amber-500/40' :
      syncStatus === 'syncing' ? 'bg-blue-950 text-blue-300 border-b border-blue-500/40 animate-pulse' :
      syncStatus === 'complete' ? 'bg-emerald-950 text-emerald-300 border-b border-emerald-500/40' :
      'bg-red-950 text-red-300 border-b border-red-500/40'
    }`}>
      <span>
        {!online ? `⚠ Offline Mode — ${pendingCount} Action${pendingCount === 1 ? '' : 's'} Pending in Queue` :
         syncStatus === 'syncing' ? `🔄 Syncing... Replaying ${pendingCount} queued action(s)...` :
         syncStatus === 'complete' ? `✅ Sync Complete!` :
         `❌ Sync Failed — ${pendingCount} pending action(s)`}
      </span>

      {pendingCount > 0 && online && syncStatus !== 'syncing' && (
        <button
          onClick={handleSync}
          className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white text-[10px] uppercase cursor-pointer"
        >
          {syncStatus === 'failed' ? 'Retry Sync' : 'Sync Now'}
        </button>
      )}
    </div>
  )
}