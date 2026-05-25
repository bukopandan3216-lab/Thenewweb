import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, removeFromCart, changeQty, subtotal, deliveryFee, grandTotal } = useCart()
  const hasItems = cart.length > 0

  const summary = useMemo(() => ({ subtotal, deliveryFee, grandTotal }), [subtotal, deliveryFee, grandTotal])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your cart</h1>
        <p className="text-slate-600 mt-2">Review items before checkout.</p>
      </div>

      {!hasItems ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-medium">Your cart is empty.</p>
          <Link to="/shop" className="btn-primary mt-6 inline-block">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.photo || 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=300&q=80'} alt={item.name}
                    className="h-24 w-24 rounded-3xl object-cover" />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-sm text-slate-500">{item.unit}</p>
                    <p className="text-sm text-slate-700 mt-2">₱{parseFloat(item.price).toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-secondary px-3 py-2" onClick={() => changeQty(item.id, -1)}>-</button>
                  <span className="font-semibold">{item.qty}</span>
                  <button type="button" className="btn-secondary px-3 py-2" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <p className="font-semibold">₱{(item.price * item.qty).toFixed(2)}</p>
                  <button type="button" className="text-sm text-red-600 hover:text-red-700" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside className="card p-6 space-y-5">
            <div>
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="mt-4 space-y-3 text-slate-700">
                <div className="flex justify-between"><span>Subtotal</span><span>₱{summary.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>₱{summary.deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>₱{summary.grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full">Proceed to checkout</button>
          </aside>
        </div>
      )}
    </div>
  )
}
