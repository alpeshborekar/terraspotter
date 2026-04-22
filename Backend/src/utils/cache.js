const redis = require('../config/redis')

const get = async (key) => {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

const set = async (key, value, ttlSeconds = 3600) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

const del = async (key) => {
  await redis.del(key)
}

const delByPattern = async (pattern) => {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}

const buildKey = (...parts) => parts.join(':')

module.exports = { get, set, del, delByPattern, buildKey }