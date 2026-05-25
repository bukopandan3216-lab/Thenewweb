import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFarmer } from '../services/productService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function FarmerPage() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await getFarmer(id)
        setFarmer(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load farmer.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
  if (!farmer?.farmer) return <div className="rounded-3xl bg-white p-6 text-slate-700">Farmer not found.</div>

  const { farmer: profile, products } = farmer

  return (
    <div className="space-y-8">
      <section className="card p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{profile.province || 'Local farm'}</p>
            <h1 className="text-4xl font-bold">{profile.store_name || profile.full_name}</h1>
            <p className="text-slate-600 mt-3">{profile.bio || 'Fresh harvests delivered from the farm.'}</p>
          </div>
          <div className="flex items-center gap-4">
            <img src={profile.store_photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&q=80'}
              alt={profile.store_name} className="h-28 w-28 rounded-3xl object-cover" />
            <div className="space-y-1 text-right">
              <div className="text-slate-500">Rating</div>
              <div className="text-2xl font-semibold">{profile.rating || 0}.0</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Available products</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className="card p-5">
              <img src={product.photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&q=80'}
                alt={product.name} className="rounded-3xl w-full h-44 object-cover mb-4" />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-slate-600 mt-2 line-clamp-2">{product.description || 'Quality farm ingredients.'}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                <span>₱{parseFloat(product.price).toFixed(2)}</span>
                <span>{product.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
