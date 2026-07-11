import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import NotificationBell from '../ui/NotificationBell'

export default function Navbar({ title = 'SmartPol AI', showSearch = true }) {
  const { user } = useAuth()
  const { toggleSidebar } = useApp()

  return (
    <header className="flex justify-between items-center w-full px-lg h-16 sticky top-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
      <div className="flex items-center gap-xl">
        <button className="md:hidden material-symbols-outlined text-primary" onClick={toggleSidebar}>menu</button>
        <div className="font-display-lg-mobile text-display-lg-mobile font-bold tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(180,197,255,0.4)]">
          {title}
        </div>
        {showSearch && (
          <div className="relative cyber-input hidden lg:block">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-primary/60">search</span>
            <input className="bg-surface-container-highest/40 border-none pl-12 pr-md py-2 w-80 text-sm focus:ring-1 focus:ring-primary/40 rounded-sm font-mono-data" placeholder="Scan identification or case ID..." type="text" />
            <div className="scan-line" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-lg">
        <div className="flex gap-md">
          <NotificationBell />
          <button className="material-symbols-outlined text-primary hover:brightness-125 transition-all active:scale-95">security</button>
          <button className="material-symbols-outlined text-primary hover:brightness-125 transition-all active:scale-95">settings</button>
        </div>
        <div className="h-8 w-px bg-primary/20 mx-sm" />
        <div className="flex items-center gap-md">
          <div className="text-right hidden sm:block">
            <p className="font-title-sm text-sm text-on-surface">{user?.first_name} {user?.last_name}</p>
            <p className="font-label-caps text-[10px] text-primary">{user?.badge_id || user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary-container flex items-center justify-center text-white font-bold text-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>
      </div>
    </header>
  )
}
