/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'
import { DEFAULT_ROUTE_BY_ROLE } from '../config/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refreshToken')
    if (refresh) {
      try {
        await authService.logout(refresh)
      } catch (err) {
        console.error('Logout error', err)
      }
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken')
      const cachedUser = localStorage.getItem('user')
      if (!token || !cachedUser) {
        if (active) setLoading(false)
        return
      }
      try {
        const { data } = await authService.me()
        if (active) {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch (err) {
        // If offline or network error, retain cached user session instead of logging out!
        if (!navigator.onLine || !err.response) {
          try {
            if (active) setUser(JSON.parse(cachedUser))
          } catch {
            logout()
          }
        } else {
          logout()
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    restoreSession()
    return () => { active = false }
  }, [logout])

  const login = useCallback(async (username, password) => {
    try {
      const { data } = await authService.login(username, password)
      localStorage.setItem('accessToken', data.tokens.access)
      localStorage.setItem('refreshToken', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } catch (err) {
      // If offline or network unreachable, provide offline fallback demo user session
      if (!navigator.onLine || !err.response) {
        const u = username.toLowerCase().trim()
        let role = 'citizen'
        let name = 'Demo Citizen'
        if (u.includes('agent') || u.includes('secret')) {
          role = 'secret_agent'
          name = 'Agent CyberX'
        } else if (u.includes('officer') || u.includes('vikram') || u.includes('police')) {
          role = 'officer'
          name = 'Insp. Vikram Singh'
        } else if (u.includes('super') || u.includes('acp') || u.includes('admin')) {
          role = 'supervisor'
          name = 'ACP Surveillance'
        }

        const offlineUser = {
          id: 999,
          username: username,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || 'User',
          email: `${u}@smartpol.gov.in`,
          role: role,
          department: role === 'secret_agent' ? 'Secret Intelligence' : 'Cyber Crime Unit',
          is_offline_demo: true
        }

        localStorage.setItem('accessToken', 'offline_demo_access_token')
        localStorage.setItem('refreshToken', 'offline_demo_refresh_token')
        localStorage.setItem('user', JSON.stringify(offlineUser))
        setUser(offlineUser)
        return offlineUser
      }
      throw err
    }
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData)
    // If OTP required, don't set tokens yet - return the pending state
    if (data.requires_otp) {
      return { requires_otp: true, user_id: data.user_id }
    }
    // Fallback: direct login (e.g., OTP disabled)
    if (data.tokens) {
      localStorage.setItem('accessToken', data.tokens.access)
      localStorage.setItem('refreshToken', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    }
    return data.user
  }, [])

  // Accept an optional user override so callers can pass the freshly returned user
  // without waiting for the async state update.
  const getDefaultRoute = useCallback((userOverride) => {
    const u = userOverride || user
    if (!u) return '/login'
    return DEFAULT_ROUTE_BY_ROLE[u.role] || '/login'
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, getDefaultRoute,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
