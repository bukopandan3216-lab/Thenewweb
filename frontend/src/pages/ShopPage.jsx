import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/productService'
import LoadingSpinner from '../components/LoadingSpinner'

const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'herbs']

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await getProducts({ search, category })
        setProducts(data.products)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load products.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, category])

  const updateQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop fresh produce</h1>
          <p className="text-slate-600 mt-2">Filter by category or search for local farm products.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-[280px_1fr]">
        <aside className="card p-5">
          <div className="space-y-4">
            <div>
              <label className="label">Search</label>
              <input value={search} onChange={(e) => { setSearch(e.target.value); updateQuery('search', e.target.value) }}
                className="input" placeholder="Search produce, farms or category" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); updateQuery('category', e.target.value) }} className="input">
                {categories.map(item => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-slate-700">No products matched your search.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(product => (
                <Link key={product.id} to={`/shop/${product.id}`} className="card p-5 hover:shadow-xl transition-shadow">
                  <img src={product.photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&q=80'} alt={product.name}
                    className="h-44 w-full rounded-3xl object-cover mb-4" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm uppercase text-slate-500">{product.category}</span>
                      <span className="text-sm font-semibold text-brand-600">{product.availability || 'Available'}</span>
                    </div>
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <p className="text-slate-600 line-clamp-2">{product.description || 'Quality farm produce.'}</p>
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
                      <span className="font-semibold">₱{parseFloat(product.price).toFixed(2)}</span>
                      <span>{product.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
