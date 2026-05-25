import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const saveSession = (token, userData) => {
    localStorage.setItem('fd_token', token)
    localStorage.setItem('fd_user',  JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveSession(data.token, data.user)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }

  const register = async (formData) => {
    setLoading(true); setError(null)
    try {
      const { data } = await api.post('/auth/register', formData)
      saveSession(data.token, data.user)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      setError(msg); throw new Error(msg)
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('fd_token')
    localStorage.removeItem('fd_user')
    localStorage.removeItem('fd_cart')
    setUser(null)
  }

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('fd_token')) return
    try {
      const { data } = await api.get('/auth/profile')
      const updated  = { ...user, ...data.user }
      localStorage.setItem('fd_user', JSON.stringify(updated))
      setUser(updated)
    } catch { logout() }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
