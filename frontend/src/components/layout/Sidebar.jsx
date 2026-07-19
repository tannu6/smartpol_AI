import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { NAV_BY_ROLE } from "../../config/navigation";
import { useTranslation } from "react-i18next";

export default function Sidebar({ subtitle = "District 7 Command" }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useApp();

  const navItems = NAV_BY_ROLE[user?.role] || [];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-primary/10 text-primary border-l-2 border-secondary"
        : "text-on-surface-variant hover:bg-surface-variant/30 hover:text-secondary"
    }`;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-primary/10 flex flex-col py-md transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="px-md mb-xl">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-lg border border-primary/30">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                security
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">{t('sidebar.title')}</h1>
              <p className="flex items-center gap-xs font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-sm space-y-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-caps text-label-caps">{item.tKey ? t(item.tKey) : item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-md pt-lg border-t border-primary/10 mt-auto space-y-md">
          {(user?.role === "officer" || user?.role === "supervisor") && (
            <button className="w-full py-md bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-95 transition-all">
              {t('nav.dispatch')}
            </button>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-error hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-caps text-label-caps">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}