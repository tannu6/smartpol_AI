/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false)

  return (
    <AppContext.Provider value={{
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar: () => setSidebarOpen((v) => !v),
      notifications,
      setNotifications,
      dispatchModalOpen,
      setDispatchModalOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
