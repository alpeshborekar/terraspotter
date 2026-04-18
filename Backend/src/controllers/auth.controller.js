const authService = require('../services/auth.service')

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    await authService.logout(refreshToken)
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email)
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
  } catch (err) {
    next(err)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body)
    res.json({ success: true, message: 'Password reset successfully' })
  } catch (err) {
    next(err)
  }
}

const me = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, me }