import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function FarmerDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [dashRes, analyticsRes, ordersRes, productsRes] = await Promise.all([
          api.get('/products/farmer/dashboard'),
          api.get('/products/farmer/analytics'),
          api.get('/products/farmer/orders'),
          api.get('/products/farmer/my'),
        ])
        setStats(dashRes.data.data)
        setAnalytics(analyticsRes.data)
        setOrders(ordersRes.data.orders)
        setProducts(productsRes.data.products)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load farm dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Dashboard</h1>
          <p className="text-slate-600 mt-1">Track products, orders, and farm performance.</p>
        </div>
        <Link to="/farmer/products" className="btn-primary inline-block">+ Add product</Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Active products</p>
          <p className="text-4xl font-bold mt-3 text-brand-700">{stats?.total_products || 0}</p>
          <p className="text-xs text-slate-500 mt-2">Ready to sell</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Total orders</p>
          <p className="text-4xl font-bold mt-3 text-blue-600">{stats?.total_orders || 0}</p>
          <p className="text-xs text-slate-500 mt-2">All time</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Revenue</p>
          <p className="text-3xl font-bold mt-3 text-emerald-600">₱{parseFloat(stats?.total_revenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 mt-2">Total earnings</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Customer rating</p>
          <p className="text-4xl font-bold mt-3 text-yellow-600">{stats?.rating || 0}⭐</p>
          <p className="text-xs text-slate-500 mt-2">Based on reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
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
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Recent orders</h2>
              <div className="space-y-3">
                {stats?.recent_orders?.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-semibold">{order.unique_order_id}</p>
                      <p className="text-sm text-slate-500">{order.buyer_name}</p>
                    </div>
                    <p className="font-semibold">₱{parseFloat(order.grand_total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Monthly summary</h2>
              <dl className="space-y-3 text-slate-700">
                <div className="flex justify-between">
                  <span>Orders this month</span>
                  <span className="font-semibold">{analytics?.orders_month || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales this month</span>
                  <span className="font-semibold">₱{parseFloat(analytics?.sales_month || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Top product</span>
                  <span className="font-semibold">{analytics?.top_product || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfillment rate</span>
                  <span className="font-semibold">{analytics?.satisfaction || 0}%</span>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          {orders.length === 0 ? (
            <div className="card p-8 text-center text-slate-600">No orders yet.</div>
          ) : (
            <div className="grid gap-3">
              {orders.map(order => (
                <div key={order.id} className="card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{order.unique_order_id}</p>
                      <p className="text-sm text-slate-500">{order.buyer_name} · {order.item_count} items</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold capitalize badge badge-process">{order.status}</span>
                      <p className="font-semibold">₱{parseFloat(order.grand_total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your products</h2>
          {products.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-600 mb-4">No products listed yet.</p>
              <Link to="/farmer/products" className="btn-primary inline-block">Add your first product</Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <div key={product.id} className="card p-4">
                  <img src={product.photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80'}
                    alt={product.name} className="w-full h-32 rounded-2xl object-cover mb-3" />
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-slate-500">{product.category}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-semibold">₱{parseFloat(product.price).toFixed(2)}</p>
                    <p className="text-xs bg-slate-100 px-2.5 py-1 rounded-full">{product.stock_qty} {product.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
