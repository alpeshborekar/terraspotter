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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})




app.use('/api/auth', require('./routes/auth.routes'))

app.use(errorHandler)

module.exports = app