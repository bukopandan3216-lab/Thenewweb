const db = require('../config/db')

const getDashboard = async (req, res, next) => {
  try {
    const [[activeUsers]] = await db.query("SELECT COUNT(*) AS active_users FROM users WHERE status='active'")
    const [[activeFarmers]] = await db.query("SELECT COUNT(*) AS active_farmers FROM users WHERE role='farmer' AND status='active'")
    const [[pendingFarmers]] = await db.query("SELECT COUNT(*) AS pending_farmers FROM users WHERE role='farmer' AND status='pending'")
    const [[totalOrders]] = await db.query("SELECT COUNT(*) AS total_orders FROM orders")
    const [[pendingOrders]] = await db.query("SELECT COUNT(*) AS pending_orders FROM orders WHERE status IN ('pending','process','packed','in_transit')")

    res.json({ success: true, dashboard: {
      active_users: activeUsers.active_users,
      active_farmers: activeFarmers.active_farmers,
      pending_farmers: pendingFarmers.pending_farmers,
      total_orders: totalOrders.total_orders,
      pending_orders: pendingOrders.pending_orders,
    }})
  } catch (err) {
    next(err)
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.contact, u.address, u.status, u.created_at,
             fp.store_name, fp.farm_location, bp.delivery_address, bp.city, bp.province
      FROM users u
      LEFT JOIN farmer_profiles fp ON fp.user_id=u.id
      LEFT JOIN buyer_profiles bp ON bp.user_id=u.id
      ORDER BY u.created_at DESC
    `)
    res.json({ success: true, users })
  } catch (err) {
    next(err)
  }
}

const getPendingApplicants = async (req, res, next) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.contact, u.address, u.created_at,
             fp.store_name, fp.farm_location, fp.province, bp.delivery_address, bp.city
      FROM users u
      LEFT JOIN farmer_profiles fp ON fp.user_id=u.id
      LEFT JOIN buyer_profiles bp ON bp.user_id=u.id
      WHERE u.status='pending'
      ORDER BY u.created_at ASC
    `)
    res.json({ success: true, users })
  } catch (err) {
    next(err)
  }
}

const getUserDetail = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id=?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' })
    const user = rows[0]
    if (user.role === 'farmer') {
      const [profile] = await db.query('SELECT * FROM farmer_profiles WHERE user_id=?', [user.id])
      user.profile = profile[0] || null
    } else {
      const [profile] = await db.query('SELECT * FROM buyer_profiles WHERE user_id=?', [user.id])
      user.profile = profile[0] || null
    }
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

const verifyUser = async (req, res, next) => {
  try {
    const { id } = req.params
    await db.query(`UPDATE users SET status='active', updated_at=NOW() WHERE id=?`, [id])
    res.json({ success: true, message: 'User verified successfully.' })
  } catch (err) {
    next(err)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'Status is required.' })
    await db.query('UPDATE users SET status=?, updated_at=NOW() WHERE id=?', [status, req.params.id])
    res.json({ success: true, message: 'Status updated.' })
  } catch (err) {
    next(err)
  }
}

const getAllProducts = async (req, res, next) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, u.full_name AS farmer_name, fp.store_name, fp.store_photo
      FROM products p
      JOIN users u ON u.id=p.farmer_id
      LEFT JOIN farmer_profiles fp ON fp.user_id=u.id
      ORDER BY p.created_at DESC
    `)
    res.json({ success: true, products })
  } catch (err) {
    next(err)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.full_name AS buyer_name, f.full_name AS farmer_name, fp.store_name AS farmer_store
      FROM orders o
      JOIN users u ON u.id=o.buyer_id
      JOIN users f ON f.id=o.farmer_id
      LEFT JOIN farmer_profiles fp ON fp.user_id=f.id
      ORDER BY o.created_at DESC
    `)
    res.json({ success: true, orders })
  } catch (err) {
    next(err)
  }
}

const getActivityLog = async (req, res, next) => {
  try {
    const [orders] = await db.query(`
      SELECT o.id, o.unique_order_id, o.status, o.grand_total, o.created_at,
             u.full_name AS buyer_name, f.full_name AS farmer_name
      FROM orders o
      JOIN users u ON u.id=o.buyer_id
      JOIN users f ON f.id=o.farmer_id
      ORDER BY o.created_at DESC LIMIT 20
    `)
    res.json({ success: true, activity: orders })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getDashboard,
  getAllUsers,
  getPendingApplicants,
  getUserDetail,
  verifyUser,
  updateStatus,
  getAllProducts,
  getAllOrders,
  getActivityLog,
}
