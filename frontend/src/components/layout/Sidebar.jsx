import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { NAV_BY_ROLE } from "../../config/navigation";

export default function Sidebar({ subtitle = "District 7 Command" }) {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useApp();

  const navItems = NAV_BY_ROLE[user?.role] || [];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600/20 text-cyan-400 border-l-4 border-cyan-400"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-[#101a2e]/95 backdrop-blur-xl border-r border-blue-500/20 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="p-6 border-b border-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="material-symbols-outlined text-white">
                security
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-blue-300">
                SmartPol AI
              </h1>

              <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">
                {item.icon}
              </span>

              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-blue-500/10 p-4">
          {(user?.role === "officer" ||
            user?.role === "supervisor") && (
            <button className="mb-4 w-full rounded-lg border border-red-500 bg-red-500/10 py-3 text-sm font-bold tracking-widest text-red-400 hover:bg-red-500/20">
              DISPATCH
            </button>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <span className="material-symbols-outlined">
              logout
            </span>

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}