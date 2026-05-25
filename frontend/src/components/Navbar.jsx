import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems }   = useCart()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)
  const [menu, setMenu]  = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const navCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-brand-700">
            🌾 <span>FarmDirect</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navCls}>Home</NavLink>
            <NavLink to="/shop" className={navCls}>Shop</NavLink>
            <NavLink to="/farmers" className={navCls}>Farmers</NavLink>
            <NavLink to="/about" className={navCls}>About</NavLink>
            <NavLink to="/contact" className={navCls}>Contact</NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user?.role === 'buyer' && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-brand-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setMenu(!menu)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden md:block">{user.full_name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      {user.role === 'buyer' && (
                        <Link to="/account" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Account</Link>
                      )}
                      {user.role === 'farmer' && (
                        <Link to="/farmer/dashboard" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Farmer Dashboard</Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Panel</Link>
                      )}
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:block">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-100 py-3">
              <div className="flex flex-col gap-3 pb-3">
                {[['/', 'Home'], ['/shop', 'Shop'], ['/farmers', 'Farmers'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                  <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                    className={({ isActive }) => `text-sm font-medium px-2 ${isActive ? 'text-brand-600' : 'text-slate-700'}`}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Close dropdown on outside click */}
      {menu && <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />}
    </nav>
  )
}
