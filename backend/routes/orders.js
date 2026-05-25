const router = require('express').Router()
const { authMiddleware, buyerOnly } = require('../middleware/auth')
const { createOrder, myOrders, cancelOrder, markReceived } = require('../controllers/orderController')

router.post('/',              authMiddleware, buyerOnly, createOrder)
router.get ('/my',            authMiddleware, buyerOnly, myOrders)
router.post('/:id/cancel',    authMiddleware, buyerOnly, cancelOrder)
router.post('/:id/received',  authMiddleware, buyerOnly, markReceived)

module.exports = router
