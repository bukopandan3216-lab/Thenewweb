import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import FarmersPage from './pages/FarmersPage'
import FarmerPage from './pages/FarmerPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import FarmerDashboard from './pages/FarmerDashboard'
import AdminPanel from './pages/AdminPanel'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:id" element={<ProductPage />} />
              <Route path="/farmers" element={<FarmersPage />} />
              <Route path="/farmers/:id" element={<FarmerPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute allowedRoles={[ 'buyer', 'admin' ]} />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ 'farmer', 'admin' ]} />}>
                <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[ 'admin' ]} />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>

              <Route path="/logout" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
