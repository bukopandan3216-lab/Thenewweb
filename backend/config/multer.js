const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jfif']
const MAX_SIZE      = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5 MB

// Ensure upload subdirectories exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subdir = 'general'
    if (file.fieldname === 'store_photo')  subdir = 'stores'
    if (file.fieldname === 'photo')        subdir = 'products'
    if (file.fieldname === 'id_photo')     subdir = 'ids'
    if (file.fieldname === 'face_photo')   subdir = 'faces'
    if (file.fieldname === 'receipt_photo') subdir = 'receipts'

    const uploadDir = path.join(process.env.UPLOAD_DIR || 'uploads', subdir)
    ensureDir(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  cb(null, ALLOWED_TYPES.includes(file.mimetype))
}

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter })

module.exports = upload
