import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd_cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('fd_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock_qty) return prev
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const changeQty = (id, delta) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id !== id) return [...acc, item]
      const newQty = item.qty + delta
      if (newQty <= 0) return acc
      if (newQty > item.stock_qty) return [...acc, { ...item, qty: item.stock_qty }]
      return [...acc, { ...item, qty: newQty }]
    }, []))
  }

  const clearCart = () => setCart([])

  const totalItems  = cart.reduce((s, i) => s + i.qty, 0)
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const deliveryFee = 50
  const grandTotal  = subtotal + deliveryFee

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQty, clearCart, totalItems, subtotal, deliveryFee, grandTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
