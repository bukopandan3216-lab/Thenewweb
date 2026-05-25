const router  = require('express').Router()
const upload  = require('../config/multer')
const { authMiddleware, farmerOnly } = require('../middleware/auth')
const {
  getProducts, getProduct, getFarmers, getFarmer,
  getReviews, submitReview,
  myProducts, createProduct, updateProduct, deleteProduct, archiveProduct, restoreProduct,
  farmerDashboard, farmerAnalytics, farmerOrders, updateOrderStatus,
} = require('../controllers/productController')

// Public
router.get('/',                         getProducts)
router.get('/farmers',                  getFarmers)
router.get('/farmers/:id',              getFarmer)
router.get('/reviews/:productId',       getReviews)
router.get('/:id',                      getProduct)

// Authenticated buyer
router.post('/reviews', authMiddleware, submitReview)

// Farmer-only
router.get   ('/farmer/my',           authMiddleware, farmerOnly, myProducts)
router.get   ('/farmer/dashboard',    authMiddleware, farmerOnly, farmerDashboard)
router.get   ('/farmer/analytics',    authMiddleware, farmerOnly, farmerAnalytics)
router.get   ('/farmer/orders',       authMiddleware, farmerOnly, farmerOrders)
router.patch ('/farmer/orders/:id/status', authMiddleware, farmerOnly, updateOrderStatus)
router.post  ('/',                    authMiddleware, farmerOnly, upload.single('photo'), createProduct)
router.put   ('/:id',                 authMiddleware, farmerOnly, upload.single('photo'), updateProduct)
router.delete('/:id',                 authMiddleware, farmerOnly, deleteProduct)
router.patch ('/:id/archive',         authMiddleware, farmerOnly, archiveProduct)
router.patch ('/:id/restore',         authMiddleware, farmerOnly, restoreProduct)

module.exports = router
