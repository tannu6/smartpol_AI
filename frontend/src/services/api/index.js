import api from './client'

export const authService = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password, password_confirm) => api.post('/auth/reset-password/', { token, password, password_confirm }),
  verifyOtp: (user_id, otp_code) => api.post('/auth/verify-otp/', { user_id, code: otp_code }),
  resendOtp: (user_id) => api.post('/auth/resend-otp/', { user_id }),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/me/', data),
}

export const dashboardService = {
  get: () => api.get('/dashboard/'),
}

export const complaintService = {
  list: () => api.get('/complaints/'),
  get: (id) => api.get(`/complaints/${id}/`),
  create: (data) => api.post('/complaints/', data),
}

export const uploadService = {
  upload: (complaintId, file, fileType) => {
    const form = new FormData()
    form.append('complaint_id', complaintId)
    form.append('file', file)
    form.append('file_type', fileType || 'document')
    return api.post('/upload/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

export const priorityService = {
  list: () => api.get('/priority/'),
}

export const analyticsService = {
  get: () => api.get('/analytics/'),
}

export const suspectService = {
  getGraph: () => api.get('/suspect-graph/'),
}

export const muleService = {
  list: () => api.get('/mule-alerts/'),
}

export const scamDnaService = {
  list: () => api.get('/scam-dna/'),
}

export const secretAgentService = {
  sendMessage: (data) => api.post('/secretagent/message/', data),
  inbox: () => api.get('/secretagent/inbox/'),
}

export const notificationService = {
  list: () => api.get('/notifications/'),
}

export const evidenceService = {
  list: () => api.get('/evidence/'),
}

export const aiService = {
  analyze: (data) => api.post('/ai/analyze/', data),
}

export const adminService = {
  users: (role) => api.get('/admin/users/', { params: role ? { role } : {} }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  logs: () => api.get('/admin/logs/'),
}
