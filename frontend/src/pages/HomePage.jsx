import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getFarmers } from '../services/productService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [{ data: productsRes }, { data: farmersRes }] = await Promise.all([
          getProducts({ limit: 8 }),
          getFarmers({ limit: 6 }),
        ])
        setProducts(productsRes.products)
        setFarmers(farmersRes.farmers)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load farm direct marketplace.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-emerald-600 text-white p-10 shadow-xl">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Fresh produce from local farmers, delivered fast.</h1>
          <p className="mt-5 text-lg text-emerald-100 max-w-2xl">Shop responsibly and support verified Philippine farmers with every order. Enjoy farm-to-table freshness and transparent local sourcing.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <Link to="/farmers" className="btn-secondary">Discover Farmers</Link>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Featured produce</h2>
            <p className="text-slate-600">Browse popular items from nearby farms.</p>
          </div>
          <Link to="/shop" className="text-brand-700 font-semibold">View all products →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {products.map(product => (
              <Link key={product.id} to={`/shop/${product.id}`} className="card p-5 hover:shadow-lg transition-shadow">
                <div className="h-44 rounded-3xl bg-slate-100 overflow-hidden mb-4">
                  <img src={product.photo || 'https://images.unsplash.com/photo-1524594154902-4df7600e7b7b?w=800&q=80'} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{product.category}</p>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                  </div>
                  <p className="text-brand-700 font-bold">₱{parseFloat(product.price).toFixed(2)} / {product.unit}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{product.description || 'Fresh produce with direct farm delivery.'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Trusted farmers</h2>
            <p className="text-slate-600">Verified sellers and farm storefronts near you.</p>
          </div>
          <Link to="/farmers" className="text-brand-700 font-semibold">Meet the growers →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {farmers.map(farmer => (
            <Link key={farmer.id} to={`/farmers/${farmer.id}`} className="card p-5 hover:shadow-lg transition-shadow flex gap-4 items-center">
              <div className="h-20 w-20 rounded-3xl bg-slate-100 overflow-hidden">
                <img src={farmer.store_photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80'} alt={farmer.store_name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{farmer.province}</p>
                <h3 className="font-semibold text-lg">{farmer.store_name || farmer.full_name}</h3>
                <p className="text-sm text-slate-600">{farmer.bio || 'Local farm provider'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
