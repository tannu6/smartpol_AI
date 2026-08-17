import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DispatchModal from "../ui/DispatchModal";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout({
  children,
  title,
  subtitle,
  showSearch = true,
}) {
  const { user } = useAuth();

  useEffect(() => {
    // Only connect WebSocket for Officers/Supervisors for live alerts
    if (!user || user.role === 'citizen') return;
    
    // Determine WS protocol (ws or wss) and host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Fallback to localhost if frontend is running locally but backend is on 8000
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    
    const ws = new WebSocket(`${protocol}//${host}/ws/notifications/`);
    
    ws.onerror = () => {
      // Graceful fallback to REST API notifications polling if WS server is unavailable
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.alert_type === 'error' || data.message.includes('CRITICAL')) {
          toast.error(data.message, { 
            duration: 8000, 
            icon: '🚨',
            style: { border: '1px solid #FF3B30', backgroundColor: '#1A0B0B', color: '#FF3B30' }
          });
        } else {
          toast(data.message, { icon: '🔔' });
        }
      } catch (e) {
        console.error("WS Message Error", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return (
    <div className="relative min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-0" />

      {/* Dispatch Modal Overlay */}
      <DispatchModal />

      {/* Layout */}
      <div className="relative z-10 flex min-h-screen">

        {/* Sidebar */}
        <Sidebar subtitle={subtitle} />

        {/* Main Content */}
        <main className="flex flex-1 flex-col lg:ml-[280px] min-w-0">

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