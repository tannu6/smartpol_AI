import { useState, useEffect, useRef } from 'react'
import { notificationService } from '../../services/api'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const load = () => notificationService.list().then(({ data }) => setNotifications(Array.isArray(data) ? data : [])).catch(() => {})

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000) // poll every 15s — swap for WS later
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length
  const priorityColor = (t) => t === 'critical' ? 'text-error' : t === 'alert' ? 'text-secondary' : 'text-on-surface-variant'

  return (
    <div className="relative" ref={ref}>
      <button className="material-symbols-outlined text-primary hover:brightness-125 transition-all relative" onClick={() => setOpen(o => !o)}>
        notifications
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-sm w-80 glass-panel rounded-xl overflow-hidden z-50 shadow-2xl">
          <div className="px-md py-sm border-b border-primary/10 flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-primary">Notifications</span>
            <span className="text-[10px] text-on-surface-variant">{unread} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-primary/5">
            {notifications.length === 0 && <p className="p-md text-xs text-on-surface-variant">No notifications yet.</p>}
            {notifications.map(n => (
              <div key={n.id} className={`p-md hover:bg-primary/5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                <p className={`text-xs font-bold ${priorityColor(n.notification_type)}`}>{n.title}</p>
                <p className="text-[11px] text-on-surface-variant mt-1">{n.message}</p>
                <p className="text-[9px] text-on-surface-variant/50 font-mono-data mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}