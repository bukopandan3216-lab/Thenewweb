const jwt = require('jsonwebtoken')

// Verify JWT and attach user to req.user
function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' })
  }
  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

// Must be called after authMiddleware
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

function farmerOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'farmer' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Farmer access required' })
  }
  next()
}

function buyerOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'buyer' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Buyer access required' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly, farmerOnly, buyerOnly }
