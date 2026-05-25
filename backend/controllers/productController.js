const db = require('../config/db')

// ── PUBLIC ──────────────────────────────────────────────────

// GET /api/products?category=&search=&farmer_id=&limit=
const getProducts = async (req, res, next) => {
  try {
    const { category, search = '', farmer_id, limit = 50 } = req.query
    const like = `%${search}%`
    let sql = `
      SELECT p.id, p.name, p.variety, p.description, p.category, p.price, p.unit,
             p.stock_qty, p.harvest_date, p.availability, p.photo, p.is_active,
             p.created_at, p.farmer_id,
             u.full_name AS farmer_name,
             fp.store_name, fp.farm_location, fp.province, fp.store_photo,
             fp.rating, fp.is_verified
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      JOIN farmer_profiles fp ON fp.user_id = u.id
      WHERE p.is_active = 1 AND p.is_deleted = 0 AND p.stock_qty > 0
        AND u.status = 'active'
        AND (p.name LIKE ? OR p.description LIKE ? OR fp.store_name LIKE ? OR u.full_name LIKE ?)`
    const params = [like, like, like, like]
    if (category && category !== 'all') { sql += ' AND p.category = ?'; params.push(category) }
    if (farmer_id) { sql += ' AND p.farmer_id = ?'; params.push(parseInt(farmer_id)) }
    sql += ' ORDER BY p.created_at DESC LIMIT ?'
    params.push(parseInt(limit))
    const [products] = await db.query(sql, params)
    res.json({ success: true, products })
  } catch (err) { next(err) }
}

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.full_name AS farmer_name,
             fp.store_name, fp.farm_location, fp.province, fp.store_photo,
             fp.bio, fp.rating, fp.is_verified, fp.gcash_number, fp.paymaya_number
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      JOIN farmer_profiles fp ON fp.user_id = u.id
      WHERE p.id = ? AND p.is_active = 1 AND p.is_deleted = 0`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ success: true, product: rows[0] })
  } catch (err) { next(err) }
}

// GET /api/products/farmers?limit=
const getFarmers = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20'), 50)
    const [farmers] = await db.query(`
      SELECT u.id, u.full_name, fp.store_name, fp.store_photo,
             fp.farm_location, fp.province, fp.bio,
             fp.rating, fp.total_sales, fp.is_verified
      FROM users u
      JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role = 'farmer' AND u.status = 'active'
      ORDER BY fp.is_verified DESC, fp.total_sales DESC
      LIMIT ?`, [limit])
    res.json({ success: true, farmers })
  } catch (err) { next(err) }
}

// GET /api/products/farmers/:id
const getFarmer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const [rows] = await db.query(`
      SELECT u.id, u.full_name, u.contact, u.email,
             fp.store_name, fp.store_photo, fp.farm_location, fp.province,
             fp.bio, fp.gcash_number, fp.paymaya_number, fp.rating,
             fp.total_sales, fp.is_verified
      FROM users u JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ? AND u.role = 'farmer'`, [id])
    if (!rows[0]) return res.status(404).json({ message: 'Farmer not found.' })

    const [products] = await db.query(`
      SELECT * FROM products
      WHERE farmer_id = ? AND is_active = 1 AND is_deleted = 0
      ORDER BY created_at DESC`, [id])
    res.json({ success: true, farmer: rows[0], products })
  } catch (err) { next(err) }
}

// GET /api/products/reviews/:productId
const getReviews = async (req, res, next) => {
  try {
    const pid = parseInt(req.params.productId)
    const [reviews] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS buyer_name
      FROM reviews r JOIN users u ON u.id = r.buyer_id
      WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 20`, [pid])
    const [avg] = await db.query('SELECT COALESCE(AVG(rating),0) AS avg, COUNT(*) AS cnt FROM reviews WHERE product_id=?', [pid])
    res.json({ success: true, reviews, avg_rating: parseFloat(avg[0].avg).toFixed(1), review_count: parseInt(avg[0].cnt) })
  } catch (err) { next(err) }
}

// POST /api/products/reviews
const submitReview = async (req, res, next) => {
  try {
    const { id: buyerId, role } = req.user
    if (role !== 'buyer') return res.status(403).json({ message: 'Buyers only.' })
    const { order_id, product_id, rating, comment } = req.body
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5.' })

    // Verify buyer has a delivered order with this product
    const [check] = await db.query(`
      SELECT o.farmer_id FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ? AND o.buyer_id = ? AND oi.product_id = ? AND o.status = 'delivered'`, [order_id, buyerId, product_id])
    if (!check[0]) return res.status(403).json({ message: 'You can only review products from delivered orders.' })

    const farmerId = check[0].farmer_id
    const [ex] = await db.query('SELECT id FROM reviews WHERE order_id=? AND buyer_id=? AND product_id=?', [order_id, buyerId, product_id])
    if (ex[0]) {
      await db.query('UPDATE reviews SET rating=?,comment=?,created_at=NOW() WHERE id=?', [rating, comment||'', ex[0].id])
    } else {
      await db.query('INSERT INTO reviews(order_id,buyer_id,farmer_id,product_id,rating,comment) VALUES(?,?,?,?,?,?)',
        [order_id, buyerId, farmerId, product_id, rating, comment||''])
    }

    // Refresh farmer avg rating
    const [av] = await db.query('SELECT COALESCE(AVG(rating),0) AS avg FROM reviews WHERE farmer_id=?', [farmerId])
    await db.query('UPDATE farmer_profiles SET rating=? WHERE user_id=?', [av[0].avg, farmerId])
    res.json({ success: true, message: 'Review submitted.' })
  } catch (err) { next(err) }
}

// ── FARMER: PRODUCT MANAGEMENT ──────────────────────────────

// GET /api/products/my?status=active|archived|deleted
const myProducts = async (req, res, next) => {
  try {
    const farmerId = req.user.id
    const status   = req.query.status || 'active'
    let sql = 'SELECT * FROM products WHERE farmer_id=?'
    if (status === 'archived') sql += ' AND is_active=0 AND is_deleted=0'
    else if (status === 'deleted') sql += ' AND is_deleted=1'
    else sql += ' AND is_active=1 AND is_deleted=0'
    sql += ' ORDER BY created_at DESC'
    const [products] = await db.query(sql, [farmerId])
    res.json({ success: true, products })
  } catch (err) { next(err) }
}

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const farmerId = req.user.id
    const { name, variety, description, category, price, unit, stock_qty, harvest_date, availability } = req.body
    if (!name || !category || !price) return res.status(400).json({ message: 'Name, category and price required.' })

    const photo = req.file ? `/uploads/products/${req.file.filename}` : (req.body.photo || null)

    const [dup] = await db.query('SELECT id FROM products WHERE farmer_id=? AND LOWER(name)=LOWER(?) AND is_deleted=0', [farmerId, name])
    if (dup[0]) return res.status(409).json({ message: 'A product with this name already exists.' })

    const [r] = await db.query(`
      INSERT INTO products(farmer_id,name,variety,description,category,price,unit,stock_qty,harvest_date,availability,photo)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [farmerId, name, variety||null, description||'', category, parseFloat(price),
       unit||'kg', parseInt(stock_qty||0), harvest_date||null, availability||'Onhand', photo])
    res.status(201).json({ success: true, id: r.insertId, message: 'Product created.' })
  } catch (err) { next(err) }
}

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const farmerId = req.user.id
    const pid      = parseInt(req.params.id)
    const { name, variety, description, category, price, unit, stock_qty, harvest_date, availability } = req.body
    const photo = req.file ? `/uploads/products/${req.file.filename}` : undefined

    let sql  = 'UPDATE products SET name=?,variety=?,description=?,category=?,price=?,unit=?,stock_qty=?,harvest_date=?,availability=?,updated_at=NOW()'
    const ps = [name, variety||null, description||'', category, parseFloat(price), unit||'kg', parseInt(stock_qty||0), harvest_date||null, availability||'Onhand']
    if (photo) { sql += ',photo=?'; ps.push(photo) }
    sql += ' WHERE id=? AND farmer_id=?'
    ps.push(pid, farmerId)

    await db.query(sql, ps)
    res.json({ success: true, message: 'Product updated.' })
  } catch (err) { next(err) }
}

// DELETE /api/products/:id  (soft delete)
const deleteProduct = async (req, res, next) => {
  try {
    await db.query('UPDATE products SET is_active=0,is_deleted=1 WHERE id=? AND farmer_id=?', [req.params.id, req.user.id])
    res.json({ success: true, message: 'Product deleted.' })
  } catch (err) { next(err) }
}

// PATCH /api/products/:id/archive
const archiveProduct = async (req, res, next) => {
  try {
    await db.query('UPDATE products SET is_active=0,is_deleted=0 WHERE id=? AND farmer_id=?', [req.params.id, req.user.id])
    res.json({ success: true, message: 'Product archived.' })
  } catch (err) { next(err) }
}

// PATCH /api/products/:id/restore
const restoreProduct = async (req, res, next) => {
  try {
    await db.query('UPDATE products SET is_active=1,is_deleted=0 WHERE id=? AND farmer_id=?', [req.params.id, req.user.id])
    res.json({ success: true, message: 'Product restored.' })
  } catch (err) { next(err) }
}

// GET /api/products/farmer-dashboard
const farmerDashboard = async (req, res, next) => {
  try {
    const fid = req.user.id
    const [[s1]] = await db.query('SELECT COUNT(*) AS c FROM products WHERE farmer_id=? AND is_active=1', [fid])
    const [[s2]] = await db.query('SELECT COUNT(*) AS c FROM orders WHERE farmer_id=?', [fid])
    const [[s3]] = await db.query("SELECT COALESCE(SUM(grand_total),0) AS c FROM orders WHERE farmer_id=? AND status!='cancelled'", [fid])
    const [[s4]] = await db.query('SELECT COALESCE(AVG(rating),0) AS c FROM reviews WHERE farmer_id=?', [fid])
    const [recent] = await db.query(`
      SELECT o.id, o.unique_order_id, o.grand_total, o.status, o.created_at,
             u.full_name AS buyer_name
      FROM orders o JOIN users u ON o.buyer_id=u.id
      WHERE o.farmer_id=? ORDER BY o.created_at DESC LIMIT 5`, [fid])
    res.json({ success: true, data: {
      total_products: s1.c, total_orders: s2.c,
      total_revenue: parseFloat(s3.c), rating: parseFloat(s4.c).toFixed(2),
      recent_orders: recent,
    }})
  } catch (err) { next(err) }
}

// GET /api/products/farmer-analytics?year=
const farmerAnalytics = async (req, res, next) => {
  try {
    const fid  = req.user.id
    const year = parseInt(req.query.year || new Date().getFullYear())
    const thisMonth = new Date().getMonth() + 1

    const [monthly] = await db.query(`
      SELECT MONTH(created_at) AS month, COUNT(*) AS total_orders,
             COALESCE(SUM(grand_total),0) AS total_sales
      FROM orders WHERE farmer_id=? AND YEAR(created_at)=? AND status!='cancelled'
      GROUP BY MONTH(created_at) ORDER BY month`, [fid, year])

    const [[cur]] = await db.query(`
      SELECT COUNT(*) AS orders_month, COALESCE(SUM(grand_total),0) AS sales_month
      FROM orders WHERE farmer_id=? AND MONTH(created_at)=? AND YEAR(created_at)=? AND status!='cancelled'`,
      [fid, thisMonth, year])

    const [[top]] = await db.query(`
      SELECT p.name, SUM(oi.qty) AS total_qty
      FROM order_items oi JOIN products p ON p.id=oi.product_id
      JOIN orders o ON o.id=oi.order_id
      WHERE o.farmer_id=? AND o.status!='cancelled'
      GROUP BY p.id ORDER BY total_qty DESC LIMIT 1`, [fid])

    const [[del]] = await db.query("SELECT COUNT(*) AS c FROM orders WHERE farmer_id=? AND status='delivered'", [fid])
    const [[all]] = await db.query('SELECT COUNT(*) AS c FROM orders WHERE farmer_id=?', [fid])
    const sat = all.c > 0 ? Math.round((del.c / all.c) * 100) : 0

    res.json({ success: true, monthly, orders_month: cur.orders_month, sales_month: parseFloat(cur.sales_month),
               top_product: top?.name || 'N/A', satisfaction: sat })
  } catch (err) { next(err) }
}

// GET /api/products/farmer-orders?status=
const farmerOrders = async (req, res, next) => {
  try {
    const fid    = req.user.id
    const status = req.query.status
    let sql = `
      SELECT o.id, o.unique_order_id, o.grand_total, o.total_amount, o.delivery_fee,
             o.delivery_address, o.payment_method, o.status, o.created_at,
             u.full_name AS buyer_name, COUNT(oi.id) AS item_count
      FROM orders o JOIN users u ON o.buyer_id=u.id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.farmer_id=?`
    const params = [fid]
    if (status && status !== 'all') { sql += ' AND o.status=?'; params.push(status) }
    sql += ' GROUP BY o.id ORDER BY o.created_at DESC'
    const [orders] = await db.query(sql, params)
    res.json({ success: true, orders })
  } catch (err) { next(err) }
}

// PATCH /api/products/farmer-orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const allowed = ['process','packed','in_transit','delivered','cancelled']
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status.' })
    await db.query('UPDATE orders SET status=?,updated_at=NOW() WHERE id=? AND farmer_id=?',
      [status, req.params.id, req.user.id])
    res.json({ success: true, message: 'Order status updated.' })
  } catch (err) { next(err) }
}

module.exports = {
  getProducts, getProduct, getFarmers, getFarmer,
  getReviews, submitReview,
  myProducts, createProduct, updateProduct, deleteProduct, archiveProduct, restoreProduct,
  farmerDashboard, farmerAnalytics, farmerOrders, updateOrderStatus,
}
