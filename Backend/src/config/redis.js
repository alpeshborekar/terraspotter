const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err.message))

module.exports = redis