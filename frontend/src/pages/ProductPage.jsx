import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProduct } from '../services/productService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await getProduct(id)
        setProduct(data.product)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load product.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleAdd = () => {
    addToCart({ id: product.id, name: product.name, price: parseFloat(product.price), unit: product.unit, stock_qty: product.stock_qty, photo: product.photo })
    navigate('/cart')
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>
  if (error) return <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
  if (!product) return <div className="rounded-3xl bg-white p-6 text-slate-700">Product not found.</div>

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <img src={product.photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1200&q=80'}
          alt={product.name} className="w-full rounded-[28px] object-cover max-h-[520px]" />
        <div className="card p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>
            <p className="text-3xl font-bold text-brand-700">₱{parseFloat(product.price).toFixed(2)} / {product.unit}</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-slate-600">Farmer</p>
              <p className="font-semibold">{product.farmer_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-600">Harvest date</p>
              <p>{product.harvest_date || 'Available now'}</p>
            </div>
          </div>
          <p className="mt-6 text-slate-700 leading-7">{product.description || 'This item is sourced directly from the farm and prepared for delivery.'}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={handleAdd} className="btn-primary w-full sm:w-auto">Add to cart</button>
            <button onClick={() => navigate('/shop')} className="btn-secondary w-full sm:w-auto">Continue browsing</button>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Product details</h2>
          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Available stock</span><span>{product.stock_qty}</span></div>
            <div className="flex justify-between"><span>Farmer store</span><span>{product.store_name || 'Direct farm'}</span></div>
            <div className="flex justify-between"><span>Status</span><span>{product.availability || 'Onhand'}</span></div>
            <div className="flex justify-between"><span>Location</span><span>{product.farm_location || 'Philippines'}</span></div>
          </dl>
        </div>
      </aside>
    </div>
  )
}
