import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (online) return null
  return (
    <div className="fixed top-16 left-0 right-0 z-[60] bg-error text-white text-center text-xs font-bold py-2 md:pl-[280px]">
      ⚠ You're offline — changes will sync automatically once reconnected.
    </div>
  )
}