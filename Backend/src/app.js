const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { errorHandler } = require('./middleware/errorHandler')
const { generalLimiter } = require('./middleware/rateLimiter')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(generalLimiter)

app.get('/health', async (req, res) => {
  const redis = require('./config/redis')
  const prisma = require('./config/prisma')

  const checks = { status: 'ok', timestamp: new Date().toISOString(), services: {} }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.services.database = 'ok'
  } catch {
    checks.services.database = 'error'
    checks.status = 'degraded'
  }

  try {
    await redis.ping()
    checks.services.redis = 'ok'
  } catch {
    checks.services.redis = 'error'
    checks.status = 'degraded'
  }

  try {
    const axios = require('axios')
    await axios.get(`${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/health`, { timeout: 2000 })
    checks.services.ml = 'ok'
  } catch {
    checks.services.ml = 'unavailable'
  }

  res.status(checks.status === 'ok' ? 200 : 207).json(checks)
})



app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/lands', require('./routes/land.routes'))
app.use('/api/recommendations', require('./routes/recommendation.routes'))
app.use(errorHandler)

module.exports = app