import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AccountPage() {
  const { user, refreshProfile } = useAuth()
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await getMyOrders()
        setOrders(data.orders)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load orders.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      process: 'bg-blue-100 text-blue-800',
      packed: 'bg-cyan-100 text-cyan-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-slate-100 text-slate-800'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-slate-600 mt-2">Manage your profile and track orders.</p>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card p-8 space-y-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-1">Full name</h2>
            <p className="text-2xl font-semibold">{user?.full_name}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-1">Email</h2>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-1">Account type</h2>
              <p className="font-semibold capitalize px-3 py-1.5 inline-block rounded-full bg-brand-100 text-brand-700">{user?.role}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-1">Contact</h2>
              <p className="font-semibold">{user?.contact || 'Not provided'}</p>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-1">Status</h2>
              <p className="font-semibold capitalize">{user?.status}</p>
            </div>
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Account actions</h2>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            Edit profile
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors">
            Change password
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { id: 'orders', label: '📦 Orders', count: orders.length },
            { id: 'activity', label: '📊 Activity' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label} {tab.count ? `(${tab.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center">
              <p className="text-slate-600 mb-4">No orders found yet. Start shopping!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map(order => (
                <div key={order.id} className="card p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-lg">{order.unique_order_id}</p>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{order.farmer_name} • {order.items?.length || 0} items</p>
                      <p className="text-sm text-slate-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-2xl font-bold text-brand-700">₱{parseFloat(order.grand_total).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{order.delivery_address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="card p-8 text-center">
          <p className="text-slate-600">Account activity tracking coming soon.</p>
        </div>
      )}
    </div>
  )
}
