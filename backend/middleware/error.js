function errorMiddleware(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message || err)
  const status  = err.status || err.statusCode || 500
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? err.message : 'Internal server error')
    : err.message || 'Internal server error'
  res.status(status).json({ success: false, message })
}

module.exports = errorMiddleware
