const { createError } = require('./errorHandler')

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Unauthorized', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(createError('Forbidden: insufficient permissions', 403))
    }
    next()
  }
}

module.exports = authorize