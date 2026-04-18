const router = require('express').Router()
const controller = require('../controllers/auth.controller')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/authenticate')
const { authLimiter } = require('../middleware/rateLimiter')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validators')

router.post('/register', authLimiter, validate(registerSchema), controller.register)
router.post('/login', authLimiter, validate(loginSchema), controller.login)
router.post('/refresh', controller.refresh)
router.post('/logout', controller.logout)
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword)
router.get('/me', authenticate, controller.me)

module.exports = router