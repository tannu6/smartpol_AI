import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { NAV_BY_ROLE } from '../../config/navigation'

export default function Sidebar({ subtitle = 'District 7 Command' }) {
  const { user, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useApp()
  const navItems = NAV_BY_ROLE[user?.role] || []

  const linkClass = ({ isActive }) =>
    `flex items-center gap-md px-md py-sm transition-colors duration-200 font-label-caps text-label-caps ${
      isActive
        ? 'bg-primary-container/20 text-secondary border-l-2 border-secondary'
        : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary'
    }`

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container/80 backdrop-blur-2xl border-r border-primary/10 flex flex-col py-lg z-50 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:flex`}>
        <div className="px-lg mb-xl">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">SmartPol AI</h1>
              <p className="font-label-caps text-label-caps text-error uppercase tracking-widest flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" /> {subtitle}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-xs overflow-y-auto px-md">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-md mt-auto pt-lg border-t border-primary/10">
          {(user?.role === 'officer' || user?.role === 'supervisor') && (
            <button className="w-full py-md bg-error/10 border border-error/40 text-error font-bold tracking-widest text-xs animate-dispatch rounded-sm mb-lg">
              DISPATCH
            </button>
          )}
          <div className="space-y-xs">
            <button onClick={logout} className="flex items-center gap-md text-on-surface-variant px-md py-sm hover:bg-surface-variant/30 hover:text-primary transition-colors duration-200 font-label-caps text-label-caps w-full">
              <span className="material-symbols-outlined">logout</span> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
