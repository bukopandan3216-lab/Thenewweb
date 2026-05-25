import { useEffect, useState } from 'react'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminPanel() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/admin/dashboard')
        setDashboard(data.dashboard)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load admin dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin panel</h1>
        <p className="text-slate-600 mt-2">Monitor marketplace health and review user activity.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active users</p>
            <p className="text-3xl font-bold mt-3">{dashboard?.active_users ?? '—'}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Approved farmers</p>
            <p className="text-3xl font-bold mt-3">{dashboard.active_farmers ?? '—'}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Open orders</p>
            <p className="text-3xl font-bold mt-3">{dashboard.total_orders ?? '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
