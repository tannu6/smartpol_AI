import { useState, useEffect, useRef } from 'react'
import { notificationService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { translateNotificationMessage } from '../../utils/statusTranslation'

export default function NotificationBell() {
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const ref = useRef(null)
  const currentLang = i18n.language || 'en'

  const load = () => notificationService.list().then(({ data }) => setNotifications(Array.isArray(data) ? data : [])).catch(() => {})

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleListenNotifications = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Voice playback is not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      toast('Voice readout stopped.')
      return
    }

    const unreadNotifs = notifications.filter(n => !n.read)
    const notifsToSpeak = unreadNotifs.length > 0 ? unreadNotifs : notifications.slice(0, 3)

    if (notifsToSpeak.length === 0) {
      toast('No notifications to read.')
      return
    }

    setIsSpeaking(true)
    toast.success('Reading notifications aloud...')

    const langMap = { gu: 'gu-IN', hi: 'hi-IN', en: 'en-US' }
    const currentLang = langMap[i18n.language] || 'en-US'

    let textToRead = `You have ${notifications.filter(n => !n.read).length} active notifications. `
    notifsToSpeak.forEach((n, index) => {
      textToRead += `Notification ${index + 1}: ${n.title}. ${n.message}. `
    })

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = currentLang
    utterance.rate = 0.95

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const unread = notifications.filter(n => !n.read).length
  const priorityColor = (t) => t === 'critical' ? 'text-error' : t === 'alert' ? 'text-secondary' : 'text-on-surface-variant'

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1">
        <button
          onClick={handleListenNotifications}
          title={isSpeaking ? t('officerDashboard.stopListening', 'Stop Listening') : t('officerDashboard.listenNotifications', 'Listen Notifications')}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
            isSpeaking ? 'bg-error/20 text-error animate-pulse border border-error/40' : 'text-primary hover:text-secondary hover:bg-primary/10'
          }`}
        >
          <span className="material-symbols-outlined text-xl">{isSpeaking ? 'volume_off' : 'volume_up'}</span>
        </button>

        <button className="material-symbols-outlined text-primary hover:brightness-125 transition-all relative p-1.5 cursor-pointer" onClick={() => setOpen(o => !o)}>
          notifications
          {unread > 0 && (
            <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-sm w-80 glass-panel rounded-xl overflow-hidden z-50 shadow-2xl border border-primary/20 bg-surface/95 backdrop-blur-xl">
          <div className="px-md py-sm border-b border-primary/10 flex justify-between items-center bg-surface-container-low/50">
            <span className="font-label-caps text-label-caps text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">notifications</span> Notifications
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleListenNotifications}
                className="text-[10px] bg-primary/15 text-primary hover:bg-primary/30 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">{isSpeaking ? 'pause' : 'play_arrow'}</span>
                {isSpeaking ? 'Stop' : 'Listen'}
              </button>
              <span className="text-[10px] text-on-surface-variant font-mono">{unread} unread</span>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-primary/5">
            {notifications.length === 0 && <p className="p-md text-xs text-on-surface-variant">No notifications yet.</p>}
            {notifications.map(n => (
              <div key={n.id} className={`p-md hover:bg-primary/5 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                <div className="flex justify-between items-start">
                  <p className={`text-xs font-bold ${priorityColor(n.notification_type)}`}>{n.title}</p>
                  <span className="text-[9px] font-mono text-secondary px-1.5 py-0.2 rounded bg-secondary/10 uppercase">{n.notification_type || 'INFO'}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{translateNotificationMessage(n.message, currentLang)}</p>
                <p className="text-[9px] text-on-surface-variant/50 font-mono-data mt-1.5 flex justify-between items-center">
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                  <span className="text-primary hover:underline font-bold text-[10px]">Inspect →</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}