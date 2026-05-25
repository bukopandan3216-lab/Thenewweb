import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFarmers } from '../services/productService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await getFarmers({ limit: 20 })
        setFarmers(data.farmers)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load farmers.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Local farmers</h1>
        <p className="text-slate-600 mt-2">Support verified farms with quality products and transparent sourcing.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {farmers.map(farmer => (
            <Link key={farmer.id} to={`/farmers/${farmer.id}`} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-3xl overflow-hidden bg-slate-100">
                  <img src={farmer.store_photo || 'https://images.unsplash.com/photo-1515165562835-c2ec86e18c82?w=400&q=80'} alt={farmer.store_name}
                    className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{farmer.store_name || farmer.full_name}</h2>
                  <p className="text-slate-600">{farmer.farm_location || farmer.province || 'Philippines'}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-700 line-clamp-3">{farmer.bio || 'Fresh farm produce with direct delivery.'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
