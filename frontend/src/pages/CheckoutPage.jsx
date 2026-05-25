import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orderService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, clearCart, subtotal, deliveryFee, grandTotal } = useCart()
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [riderPhone, setRiderPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('pay_later')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (!address || !city || !province) {
      setError('Please provide a full delivery address.')
      return
    }
    if (!cart.length) {
      setError('Your cart is empty.')
      return
    }

    setLoading(true)
    try {
      await createOrder({ items: cart, address, city, province, rider_phone: riderPhone, payment_method: paymentMethod })
      clearCart()
      navigate('/account')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete checkout.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.3fr_0.8fr]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-slate-600 mt-2">Confirm your delivery details and complete your order.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 card p-8">
          {error && <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}
          <div>
            <label className="label">Delivery address</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, barangay, building" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">City</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="label">Province</label>
              <input className="input" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Province" />
            </div>
          </div>
          <div>
            <label className="label">Rider phone (optional)</label>
            <input className="input" value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder="Contact number" />
          </div>
          <div>
            <label className="label">Payment type</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="pay_later">Pay later</option>
              <option value="gcash">Gcash</option>
              <option value="paymaya">PayMaya</option>
            </select>
          </div>
          <div className="space-y-3 bg-slate-50 rounded-3xl p-5">
            <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm text-slate-600"><span>Delivery fee</span><span>₱{deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>₱{grandTotal.toFixed(2)}</span></div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? <LoadingSpinner /> : 'Place order'}</button>
        </form>
      </div>

      <aside className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Order review</h2>
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 last:border-b-0">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.qty} × ₱{item.price.toFixed(2)}</p>
            </div>
            <p className="font-semibold">₱{(item.qty * item.price).toFixed(2)}</p>
          </div>
        ))}
      </aside>
    </div>
  )
}
