import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({
  children,
  title,
  subtitle,
  showSearch = true,
}) {
  return (
    <div className="relative min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-0" />

      {/* Layout */}
      <div className="relative z-10 flex min-h-screen">

        {/* Sidebar */}
        <Sidebar subtitle={subtitle} />

        {/* Main Content */}
        <main className="flex flex-1 flex-col md:ml-[280px] min-w-0">

          {/* Navbar */}
          <Navbar
            title={title}
            showSearch={showSearch}
          />

          {/* Scrollable Content */}
          <section className="flex-1 overflow-y-auto overflow-x-hidden">

            <div className="
              w-full
              max-w-screen-2xl
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              py-4
            ">

              {children}

            </div>

          </section>

        </main>

      </div>
    </div>
  );
}