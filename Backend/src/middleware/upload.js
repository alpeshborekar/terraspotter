const multer = require('multer')
const { createError } = require('./errorHandler')

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(createError('Only JPEG, PNG and WebP images are allowed', 400), false)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
})

module.exports = upload