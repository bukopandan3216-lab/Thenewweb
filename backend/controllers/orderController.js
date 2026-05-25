const db = require('../config/db')

// POST /api/orders
const createOrder = async (req, res, next) => {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const buyerId = req.user.id
    const { items, address, city, province, rider_phone, payment_method = 'pay_later', payment_ref = '' } = req.body

    if (!items || !items.length) return res.status(400).json({ message: 'Cart is empty.' })
    if (!address)                return res.status(400).json({ message: 'Delivery address required.' })

    const deliveryAddress = [address, city, province].filter(Boolean).join(', ')
    const deliveryFee     = 50.00
    const orderStatus     = payment_method === 'pay_later' ? 'pending' : 'process'

    // Group items by farmer
    const farmerGroups = {}
    for (const item of items) {
      const [[product]] = await conn.query(
        'SELECT id, name, price, stock_qty, farmer_id FROM products WHERE id=? AND is_active=1 AND is_deleted=0',
        [item.product_id]
      )
      if (!product) throw Object.assign(new Error(`Product #${item.product_id} not found.`), { status: 404 })
      if (product.stock_qty < item.qty) throw Object.assign(new Error(`Not enough stock for ${product.name}.`), { status: 400 })
      if (!farmerGroups[product.farmer_id]) farmerGroups[product.farmer_id] = []
      farmerGroups[product.farmer_id].push({ product, qty: item.qty })
    }

    const createdOrders = []
    let totalSpent = 0

    for (const [farmerId, groupItems] of Object.entries(farmerGroups)) {
      const subtotal   = groupItems.reduce((s, { product, qty }) => s + product.price * qty, 0)
      const grandTotal = subtotal + deliveryFee
      const uniqueId   = 'FD-' + Math.random().toString(36).slice(2, 8).toUpperCase()

      const [r] = await conn.query(`
        INSERT INTO orders(buyer_id,farmer_id,unique_order_id,total_amount,delivery_fee,grand_total,
                           delivery_address,payment_method,rider_phone,status,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,NOW())`,
        [buyerId, farmerId, uniqueId, subtotal, deliveryFee, grandTotal,
         deliveryAddress, payment_method, rider_phone||null, orderStatus])
      const orderId = r.insertId

      for (const { product, qty } of groupItems) {
        await conn.query('INSERT INTO order_items(order_id,product_id,qty,unit_price,subtotal) VALUES(?,?,?,?,?)',
          [orderId, product.id, qty, product.price, product.price * qty])
        await conn.query('UPDATE products SET stock_qty=stock_qty-? WHERE id=? AND stock_qty>=?', [qty, product.id, qty])
      }

      // Log payment if paid
      if (payment_method !== 'pay_later' && payment_ref) {
        await conn.query('INSERT INTO payments(order_id,buyer_id,method,reference_no,amount,status) VALUES(?,?,?,?,?,?)',
          [orderId, buyerId, payment_method, payment_ref, grandTotal, 'pending'])
      }

      // Update farmer sales + analytics
      await conn.query('UPDATE farmer_profiles SET total_sales=COALESCE(total_sales,0)+? WHERE user_id=?', [grandTotal, farmerId])
      const month = new Date().getMonth() + 1, year = new Date().getFullYear()
      const [[an]] = await conn.query('SELECT id FROM analytics WHERE farmer_id=? AND month=? AND year=?', [farmerId, month, year])
      if (an) await conn.query('UPDATE analytics SET total_sales=total_sales+?,total_orders=total_orders+1 WHERE id=?', [grandTotal, an.id])
      else     await conn.query('INSERT INTO analytics(farmer_id,month,year,total_sales,total_orders) VALUES(?,?,?,?,1)', [farmerId, month, year, grandTotal])

      // Commission record
      const commAmt = parseFloat((grandTotal * (parseFloat(process.env.COMMISSION_RATE||'5') / 100)).toFixed(2))
      await conn.query('INSERT INTO commissions(order_id,farmer_id,order_total,rate,commission_amt) VALUES(?,?,?,?,?)',
        [orderId, farmerId, grandTotal, parseFloat(process.env.COMMISSION_RATE||'5'), commAmt])

      createdOrders.push({ id: orderId, unique_order_id: uniqueId, farmer_id: parseInt(farmerId),
                           grand_total: grandTotal, status: orderStatus, payment_method })
      totalSpent += grandTotal
    }

    // Update buyer stats
    const [[bp]] = await conn.query('SELECT id FROM buyer_profiles WHERE user_id=?', [buyerId])
    if (bp) await conn.query('UPDATE buyer_profiles SET total_orders=COALESCE(total_orders,0)+?,total_spent=COALESCE(total_spent,0)+? WHERE user_id=?',
                [createdOrders.length, totalSpent, buyerId])
    else     await conn.query('INSERT INTO buyer_profiles(user_id,total_orders,total_spent) VALUES(?,?,?)', [buyerId, createdOrders.length, totalSpent])

    await conn.commit()
    res.status(201).json({ success: true, orders: createdOrders, grand_total: totalSpent })
  } catch (err) {
    await conn.rollback()
    next(err)
  } finally {
    conn.release()
  }
}

// GET /api/orders/my
const myOrders = async (req, res, next) => {
  try {
    const buyerId = req.user.id
    const [orders] = await db.query(`
      SELECT o.id, o.unique_order_id, o.total_amount, o.delivery_fee, o.grand_total,
             o.delivery_address, o.payment_method, o.rider_phone, o.latitude, o.longitude,
             o.status, o.cancel_reason, o.created_at,
             u.full_name AS farmer_name, fp.store_name, fp.store_photo
      FROM orders o
      JOIN users u ON o.farmer_id=u.id
      LEFT JOIN farmer_profiles fp ON u.id=fp.user_id
      WHERE o.buyer_id=? ORDER BY o.created_at DESC`, [buyerId])

    for (const order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.photo, p.category, p.unit
        FROM order_items oi JOIN products p ON oi.product_id=p.id
        WHERE oi.order_id=?`, [order.id])
      order.items = items
    }
    res.json({ success: true, orders })
  } catch (err) { next(err) }
}

// POST /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const buyerId = req.user.id
    const orderId = parseInt(req.params.id)
    const { reason, additional_reason } = req.body
    if (!reason) return res.status(400).json({ message: 'Cancellation reason required.' })

    const [[order]] = await db.query('SELECT status FROM orders WHERE id=? AND buyer_id=?', [orderId, buyerId])
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (!['pending','process'].includes(order.status))
      return res.status(400).json({ message: 'This order can no longer be cancelled — it has been packed or dispatched.' })

    const fullReason = reason + (additional_reason ? ` — ${additional_reason}` : '')
    await db.query("UPDATE orders SET status='cancelled',cancel_reason=?,updated_at=NOW() WHERE id=?", [fullReason, orderId])
    try {
      await db.query('INSERT INTO cancel_orders(order_id,requested_by,reason,additional_reason,status) VALUES(?,?,?,?,?)',
        [orderId, buyerId, reason, additional_reason||'', 'approved'])
    } catch { /* column may not exist on older schema */ }
    res.json({ success: true, message: 'Order cancelled.' })
  } catch (err) { next(err) }
}

// POST /api/orders/:id/received
const markReceived = async (req, res, next) => {
  try {
    const buyerId = req.user.id
    const [r] = await db.query(
      "UPDATE orders SET status='delivered',updated_at=NOW() WHERE id=? AND buyer_id=? AND status IN ('in_transit','shipped','out_for_delivery')",
      [req.params.id, buyerId])
    if (r.affectedRows === 0) return res.status(400).json({ message: 'Cannot mark as received at this stage.' })
    res.json({ success: true, message: 'Order marked as received.' })
  } catch (err) { next(err) }
}

module.exports = { createOrder, myOrders, cancelOrder, markReceived }
