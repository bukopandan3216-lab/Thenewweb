require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')

const app = express()

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('CORS policy violation: ' + origin))
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// ── BODY PARSERS ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── STATIC UPLOADS ────────────────────────────────────────────
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
app.use('/uploads', express.static(uploadDir))

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/',       (_, res) => res.json({ message: '🌾 FarmDirect API is running' }))

// ── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders',   require('./routes/orders'))
app.use('/api/admin',    require('./routes/admin'))

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }))

// ── ERROR HANDLER ─────────────────────────────────────────────
app.use(require('./middleware/error'))

// ── START ─────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000')
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌾 FarmDirect API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})

module.exports = app