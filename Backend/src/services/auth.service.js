const userRepo = require('../repositories/user.repository')
const tokenRepo = require('../repositories/token.repository')
const { hashPassword, comparePassword, generateToken, hashToken } = require('../utils/hash')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const { sendPasswordResetEmail } = require('../utils/email')
const { createError } = require('../middleware/errorHandler')

const REFRESH_TOKEN_EXPIRY_DAYS = 7

const register = async ({ name, email, password, role }) => {
  const existing = await userRepo.findByEmail(email)
  if (existing) throw createError('Email already registered', 409)

  const hashed = await hashPassword(password)
  const user = await userRepo.createUser({ name, email, password: hashed, role })

  const { accessToken, refreshToken } = await _issueTokens(user)

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }
}

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email)
  if (!user) throw createError('Invalid email or password', 401)

  const valid = await comparePassword(password, user.password)
  if (!valid) throw createError('Invalid email or password', 401)

  const { accessToken, refreshToken } = await _issueTokens(user)

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  }
}

const refresh = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) throw createError('Refresh token required', 401)

  let decoded
  try {
    decoded = verifyRefreshToken(incomingRefreshToken)
  } catch {
    throw createError('Invalid or expired refresh token', 401)
  }

  const hashed = hashToken(incomingRefreshToken)
  const stored = await tokenRepo.findRefreshToken(hashed)
  if (!stored || stored.userId !== decoded.id) {
    // Possible token reuse attack — invalidate all tokens for this user
    await tokenRepo.deleteAllUserRefreshTokens(decoded.id)
    throw createError('Refresh token reuse detected. Please login again.', 401)
  }

  if (new Date() > stored.expiresAt) {
    await tokenRepo.deleteRefreshToken(hashed)
    throw createError('Refresh token expired', 401)
  }

  // Rotation: delete old, issue new
  await tokenRepo.deleteRefreshToken(hashed)

  const user = await userRepo.findById(decoded.id)
  if (!user) throw createError('User not found', 404)

  const { accessToken, refreshToken } = await _issueTokens(user)
  return { accessToken, refreshToken }
}

const logout = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) return
  const hashed = hashToken(incomingRefreshToken)
  await tokenRepo.deleteRefreshToken(hashed).catch(() => {})
}

const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email)
  // Always return success to prevent email enumeration
  if (!user) return

  const rawToken = generateToken()
  const hashed = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await tokenRepo.savePasswordResetToken(user.id, hashed, expiresAt)

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`
  await sendPasswordResetEmail(user.email, resetUrl)
}

const resetPassword = async ({ token, password }) => {
  const hashed = hashToken(token)
  const stored = await tokenRepo.findPasswordResetToken(hashed)

  if (!stored || stored.used || new Date() > stored.expiresAt) {
    throw createError('Invalid or expired reset token', 400)
  }

  const newHashed = await hashPassword(password)
  await userRepo.updateUser(stored.userId, { password: newHashed })
  await tokenRepo.markPasswordResetTokenUsed(stored.id)
  // Invalidate all refresh tokens on password change
  await tokenRepo.deleteAllUserRefreshTokens(stored.userId)
}

// Private helper
const _issueTokens = async (user) => {
  const payload = { id: user.id, email: user.email, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  const hashed = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  await tokenRepo.saveRefreshToken(user.id, hashed, expiresAt)

  return { accessToken, refreshToken }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword }