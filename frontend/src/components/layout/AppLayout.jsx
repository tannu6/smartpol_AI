import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout({ children, title, subtitle, showSearch = true }) {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden min-h-screen">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-0" />
      <div className="flex h-screen w-full relative z-10 overflow-hidden">
        <Sidebar subtitle={subtitle} />
        <main className="flex-1 flex flex-col md:ml-[280px] h-full overflow-hidden">
          <Navbar title={title} showSearch={showSearch} />
          <div className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-4">
            {children}
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
