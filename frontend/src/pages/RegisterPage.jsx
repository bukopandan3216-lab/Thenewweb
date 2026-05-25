import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const initialFields = {
  full_name: '', email: '', password: '', confirm_password: '', role: 'buyer', contact: '', delivery_address: '', city: '', province: '', store_name: '', farm_location: '', bio: '', gcash_number: '', paymaya_number: '', age: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()
  const [fields, setFields] = useState(initialFields)
  const [localError, setLocalError] = useState(null)

  const handleChange = (key, value) => setFields(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)
    if (!fields.full_name || !fields.email || !fields.password || !fields.confirm_password) {
      setLocalError('Please fill out the required fields.')
      return
    }
    if (fields.password !== fields.confirm_password) {
      setLocalError('Passwords do not match.')
      return
    }
    const payload = { ...fields }
    if (payload.role !== 'farmer') {
      delete payload.store_name
      delete payload.farm_location
      delete payload.bio
      delete payload.gcash_number
      delete payload.paymaya_number
    }
    if (payload.role !== 'buyer') {
      delete payload.delivery_address
      delete payload.city
      delete payload.province
    }

    try {
      await register(payload)
      navigate('/')
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create your FarmDirect account</h1>
        <p className="text-slate-600 mt-2">Register as a buyer or farmer to start ordering or selling fresh produce.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        {(localError || error) && <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-red-700">{localError || error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={fields.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={fields.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={fields.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input type="password" className="input" value={fields.confirm_password} onChange={(e) => handleChange('confirm_password', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Account type</label>
          <select className="input" value={fields.role} onChange={(e) => handleChange('role', e.target.value)}>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>

        {fields.role === 'buyer' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Contact number</label>
              <input className="input" value={fields.contact} onChange={(e) => handleChange('contact', e.target.value)} />
            </div>
            <div>
              <label className="label">Delivery city</label>
              <input className="input" value={fields.city} onChange={(e) => handleChange('city', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Delivery address</label>
              <input className="input" value={fields.delivery_address} onChange={(e) => handleChange('delivery_address', e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <label className="label">Store name</label>
              <input className="input" value={fields.store_name} onChange={(e) => handleChange('store_name', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Farm location</label>
                <input className="input" value={fields.farm_location} onChange={(e) => handleChange('farm_location', e.target.value)} />
              </div>
              <div>
                <label className="label">Province</label>
                <input className="input" value={fields.province} onChange={(e) => handleChange('province', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Short bio</label>
              <textarea className="input min-h-[120px] resize-none" value={fields.bio} onChange={(e) => handleChange('bio', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Gcash number</label>
                <input className="input" value={fields.gcash_number} onChange={(e) => handleChange('gcash_number', e.target.value)} />
              </div>
              <div>
                <label className="label">PayMaya number</label>
                <input className="input" value={fields.paymaya_number} onChange={(e) => handleChange('paymaya_number', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? <LoadingSpinner /> : 'Create account'}</button>
        <p className="text-sm text-slate-600">Already registered? <Link to="/login" className="text-brand-700 font-semibold">Login</Link></p>
      </form>
    </div>
  )
}
