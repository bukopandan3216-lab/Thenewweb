const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const db     = require('../config/db')

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const {
      full_name, email, password, role = 'buyer',
      contact, address, age,
      // Farmer-specific
      store_name, farm_location, province, bio,
      gcash_number, paymaya_number,
      // Buyer-specific
      delivery_address, city,
    } = req.body

    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' })

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length)
      return res.status(409).json({ message: 'Email already registered.' })

    const hashed   = await bcrypt.hash(password, 12)
    const username = email.split('@')[0] + '_' + Date.now()

    const [result] = await db.query(
      `INSERT INTO users (username, full_name, email, password, role, contact, address, age, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [username, full_name, email, hashed, role, contact || null, address || null, age || null]
    )
    const userId = result.insertId

    // Create role profile
    if (role === 'farmer') {
      await db.query(
        `INSERT INTO farmer_profiles (user_id, store_name, farm_location, province, bio, gcash_number, paymaya_number)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, store_name || '', farm_location || '', province || '', bio || '', gcash_number || null, paymaya_number || null]
      )
    } else if (role === 'buyer') {
      await db.query(
        `INSERT INTO buyer_profiles (user_id, delivery_address, city, province)
         VALUES (?, ?, ?, ?)`,
        [userId, delivery_address || '', city || '', province || '']
      )
    }

    const user = { id: userId, full_name, email, role, contact: contact || null, status: 'pending' }
    const token = signToken(userId, role)
    res.status(201).json({ success: true, token, user })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' })

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user) return res.status(404).json({ message: 'No account found with that email.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Incorrect password.' })

    if (user.status === 'rejected')
      return res.status(403).json({ message: 'Your application was rejected.' })
    if (user.status === 'suspended')
      return res.status(403).json({ message: 'Your account has been suspended.' })

    // Build user object
    const payload = {
      id: user.id, full_name: user.full_name, email: user.email,
      role: user.role, contact: user.contact, status: user.status,
    }

    // Attach role-specific profile
    if (user.role === 'farmer') {
      const [fp] = await db.query(
        `SELECT store_name, store_photo, farm_location, province, bio, gcash_number,
                paymaya_number, rating, total_sales, is_verified
         FROM farmer_profiles WHERE user_id = ?`, [user.id]
      )
      payload.profile = fp[0] || null
    } else if (user.role === 'buyer') {
      const [bp] = await db.query(
        `SELECT delivery_address, city, province, preferred_categories, total_orders, total_spent
         FROM buyer_profiles WHERE user_id = ?`, [user.id]
      )
      payload.profile = bp[0] || null
    }

    const token = signToken(user.id, user.role)
    res.json({ success: true, token, user: payload })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const { id, role } = req.user
    const [rows] = await db.query(
      'SELECT id, username, full_name, email, role, contact, address, age, status, created_at FROM users WHERE id = ?', [id]
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (role === 'farmer') {
      const [fp] = await db.query(
        `SELECT store_name, store_photo, farm_location, province, bio, gcash_number,
                paymaya_number, rating, total_sales, is_verified
         FROM farmer_profiles WHERE user_id = ?`, [id]
      )
      user.profile = fp[0] || null
    } else if (role === 'buyer') {
      const [bp] = await db.query(
        `SELECT delivery_address, city, province, preferred_categories, total_orders, total_spent
         FROM buyer_profiles WHERE user_id = ?`, [id]
      )
      user.profile = bp[0] || null
    }

    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
}

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { id, role } = req.user
    const { full_name, contact, address, age, delivery_address, city, province,
            store_name, farm_location, bio, gcash_number, paymaya_number } = req.body

    await db.query(
      'UPDATE users SET full_name=?, contact=?, address=?, age=?, updated_at=NOW() WHERE id=?',
      [full_name, contact || null, address || null, age || null, id]
    )

    if (role === 'farmer') {
      const storePhoto = req.file ? `/uploads/stores/${req.file.filename}` : undefined
      const setParts = ['store_name=?','farm_location=?','bio=?','gcash_number=?','paymaya_number=?']
      const vals     = [store_name, farm_location||'', bio||'', gcash_number||null, paymaya_number||null]
      if (storePhoto) { setParts.push('store_photo=?'); vals.push(storePhoto) }
      vals.push(id)
      await db.query(`UPDATE farmer_profiles SET ${setParts.join(',')} WHERE user_id=?`, vals)
    } else if (role === 'buyer') {
      await db.query(
        'UPDATE buyer_profiles SET delivery_address=?, city=?, province=? WHERE user_id=?',
        [delivery_address||'', city||'', province||'', id]
      )
    }

    res.json({ success: true, message: 'Profile updated.' })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user
    const { current_password, new_password } = req.body
    const [rows] = await db.query('SELECT password FROM users WHERE id=?', [id])
    const valid = await bcrypt.compare(current_password, rows[0].password)
    if (!valid) return res.status(401).json({ message: 'Current password incorrect.' })
    const hashed = await bcrypt.hash(new_password, 12)
    await db.query('UPDATE users SET password=? WHERE id=?', [hashed, id])
    res.json({ success: true, message: 'Password changed.' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getProfile, updateProfile, changePassword }
