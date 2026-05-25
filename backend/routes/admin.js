const router = require('express').Router()
const { authMiddleware, adminOnly } = require('../middleware/auth')
const {
  getDashboard, getAllUsers, getPendingApplicants,
  verifyUser, updateStatus, getUserDetail,
  getAllProducts, getAllOrders, getActivityLog,
} = require('../controllers/adminController')

router.use(authMiddleware, adminOnly)

router.get('/dashboard',          getDashboard)
router.get('/users',              getAllUsers)
router.get('/users/pending',      getPendingApplicants)
router.get('/users/:id',          getUserDetail)
router.put('/users/:id/verify',   verifyUser)
router.put('/users/:id/status',   updateStatus)
router.get('/products',           getAllProducts)
router.get('/orders',             getAllOrders)
router.get('/reports/activity',   getActivityLog)

module.exports = router
