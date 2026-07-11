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

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token || !localStorage.getItem('user')) {
        if (active) setLoading(false)
        return
      }
      try {
        const { data } = await authService.me()
        if (active) {
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
        }
      } catch {
        logout()
      } finally {
        if (active) setLoading(false)
      }
    }
    restoreSession()
    return () => { active = false }
  }, [logout])

  const login = useCallback(async (username, password) => {
    const { data } = await authService.login(username, password)
    localStorage.setItem('accessToken', data.tokens.access)
    localStorage.setItem('refreshToken', data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData)
    localStorage.setItem('accessToken', data.tokens.access)
    localStorage.setItem('refreshToken', data.tokens.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const getDefaultRoute = useCallback(() => {
    if (!user) return '/login'
    return DEFAULT_ROUTE_BY_ROLE[user.role] || '/login'
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
