import axios from 'axios'
import { enqueueOfflineAction } from '../../utils/offlineQueue'

const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // If client is explicitly offline, enqueue mutating actions into IndexedDB queue
  if (!navigator.onLine && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
    try {
      await enqueueOfflineAction({
        type: 'HTTP_REQUEST',
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
      })
    } catch (e) {
      console.error('Failed to enqueue offline action:', e)
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Catch Network Error when offline
    if (!error.response && ['post', 'put', 'patch'].includes(original?.method?.toLowerCase())) {
      try {
        await enqueueOfflineAction({
          type: 'HTTP_REQUEST',
          method: original.method,
          url: original.url,
          data: original.data,
          headers: original.headers
        })
        return Promise.resolve({
          data: { detail: 'Offline Mode: Action queued locally. Will sync when reconnected.', status: 'offline_queued' },
          status: 202,
          headers: {}
        })
      } catch (e) {
        console.error('Failed to enqueue offline action:', e)
      }
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh })
          localStorage.setItem('accessToken', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return apiClient(original)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
