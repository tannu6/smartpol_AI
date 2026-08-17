import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import NotificationBell from '../ui/NotificationBell'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function Navbar({ title, showSearch = true }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toggleSidebar } = useApp()
  const { t } = useTranslation()

  const pageTitle = title && title !== 'SmartPol AI' ? title : null

  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-primary/15 shadow-[0_0_20px_rgba(37,99,235,0.15)]">
      {/* Left section: Hamburger + Page Title */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
        <button 
          className="lg:hidden material-symbols-outlined text-primary hover:text-secondary cursor-pointer shrink-0" 
          onClick={toggleSidebar}
          title="Toggle Menu"
        >
          menu
        </button>

        {pageTitle && (
          <div className="font-display-lg-mobile text-sm sm:text-base md:text-lg font-bold tracking-tight text-primary truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]">
            {pageTitle}
          </div>
        )}

        {showSearch && (
          <div className="relative cyber-input hidden xl:block shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-sm">search</span>
            <input 
              className="bg-surface-container-highest/40 border border-primary/20 pl-9 pr-3 py-1.5 w-60 text-xs focus:ring-1 focus:ring-primary/40 rounded-md font-mono-data text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
              placeholder={t('common.search', 'Search Grid...')} 
              type="text" 
            />
            <div className="scan-line" />
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
        <LanguageSwitcher />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <NotificationBell />
          <button 
            onClick={() => {
              if (user?.role === 'secret_agent') navigate('/agent/urgent');
              else if (user?.role === 'supervisor' || user?.role === 'admin') navigate('/supervisor/war-room');
              else if (user?.role === 'officer') navigate('/officer/alerts');
              else navigate('/citizen/profile');
            }} 
            title="Intelligence Shield Console"
            className="p-1.5 text-primary hover:text-secondary transition-colors cursor-pointer rounded-lg hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-xl">security</span>
          </button>
          <button
            onClick={() => {
              if (user?.role === 'admin') navigate('/admin/config');
              else if (user?.role === 'citizen') navigate('/citizen/profile');
              else navigate('/officer/profile');
            }}
            title="System & Profile Settings"
            className="p-1.5 text-primary hover:text-secondary transition-colors cursor-pointer rounded-lg hover:bg-primary/10"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>

        <div className="h-6 w-px bg-primary/20 mx-0.5 hidden sm:block shrink-0" />

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right hidden sm:block leading-tight max-w-[140px] md:max-w-[180px]">
            <p className="font-bold text-xs text-on-surface truncate whitespace-nowrap">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Operator'}
            </p>
            <p className="font-mono text-[10px] text-primary uppercase tracking-wider truncate whitespace-nowrap">
              {user?.badge_id ? `Ref: ${user.badge_id}` : (user?.role ? user.role.replace('_', ' ') : 'USER')}
            </p>
          </div>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-inner shrink-0 uppercase">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}{user?.last_name?.[0] || ''}
          </div>
        </div>
      </div>
    </header>
  )
}