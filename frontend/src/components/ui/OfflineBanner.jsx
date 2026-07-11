import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-error/90 text-white text-center py-2 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
      <span className="material-symbols-outlined text-sm align-middle mr-2">wifi_off</span>
      SYSTEM OFFLINE — RECONNECTING...
    </div>
  )
}
