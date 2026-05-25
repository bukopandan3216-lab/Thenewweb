import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)
    if (!email || !password) {
      setLocalError('Email and password are required.')
      return
    }
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-600 mt-2">Login to access your FarmDirect dashboard and orders.</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        {(localError || error) && <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-red-700">{localError || error}</div>}
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? <LoadingSpinner /> : 'Login'}</button>
        <p className="text-sm text-slate-600">Don’t have an account? <Link to="/register" className="text-brand-700 font-semibold">Sign up</Link></p>
      </form>
    </div>
  )
}
