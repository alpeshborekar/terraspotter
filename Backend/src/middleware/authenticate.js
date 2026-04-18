const { verifyAccessToken } = require('../utils/jwt')
const { createError } = require('./errorHandler')

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Access token required', 401))
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError('Access token expired', 401))
    }
    return next(createError('Invalid access token', 401))
  }
}

module.exports = authenticate