const mysql = require('mysql2/promise')
 
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'), // Previous value: 3306
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'farmdirect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
})
 
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected to:', process.env.DB_NAME || 'farmdirect')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message)
  })
 
module.exports = pool
 