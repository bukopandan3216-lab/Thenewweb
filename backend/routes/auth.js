const router = require('express').Router()
const { authMiddleware } = require('../middleware/auth')
const upload = require('../config/multer')
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController')

router.post('/register', register)
router.post('/login',    login)
router.get ('/profile',  authMiddleware, getProfile)
router.put ('/profile',  authMiddleware, upload.single('store_photo'), updateProfile)
router.post('/change-password', authMiddleware, changePassword)

module.exports = router
