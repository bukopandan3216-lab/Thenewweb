const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export const imgUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80'
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}

export const fmt = (n) => '₱' + parseFloat(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })

export const statusColors = {
  pending:    'badge-pending',
  process:    'badge-process',
  packed:     'badge-packed',
  in_transit: 'badge-in_transit',
  delivered:  'badge-delivered',
  cancelled:  'badge-cancelled',
  active:     'badge-active',
  suspended:  'badge-suspended',
  rejected:   'badge-rejected',
}

export const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

export const statusLabel = (s) => (s || '').replace('_', ' ').toUpperCase()
