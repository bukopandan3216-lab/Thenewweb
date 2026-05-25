import api from '../api'

export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (payload) => api.post('/auth/register', payload)
export const getProfile = () => api.get('/auth/profile')
export const updateProfile = (payload) => api.put('/auth/profile', payload)
export const changePassword = (payload) => api.post('/auth/change-password', payload)
