const axios = require('axios')
const recommendationRepo = require('../repositories/recommendation.repository')
const landRepo = require('../repositories/land.repository')
const { get, set, buildKey } = require('../utils/cache')
const CircuitBreaker = require('../utils/circuitBreaker')
const { createError } = require('../middleware/errorHandler')

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000'
const CACHE_TTL = 60 * 60 // 1 hour

const mlBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
})

const getRecommendation = async (landId) => {
  const land = await landRepo.findById(landId)
  if (!land) throw createError('Land not found', 404)
  if (land.status !== 'VERIFIED') throw createError('Land must be verified before getting recommendations', 400)

  // Build deterministic cache key from land properties
  const cacheKey = buildKey(
    'recommendation',
    land.soilType,
    land.climateZone,
    Math.round(land.latitude),
    Math.round(land.longitude)
  )

  // Check cache first
  const cached = await get(cacheKey)
  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`)
    return { ...cached, landId, fromCache: true }
  }

  // Call ML service through circuit breaker
  let mlResponse
  try {
    mlResponse = await mlBreaker.call(() =>
      axios.post(
        `${ML_URL}/predict`,
        {
          temperature: _estimateTemp(land.climateZone),
          rainfall: _estimateRainfall(land.climateZone),
          soil_type: land.soilType,
          climate_zone: land.climateZone,
        },
        { timeout: 5000 }
      )
    )
  } catch (err) {
    // Circuit open or ML down — check DB for last recommendation
    console.warn('ML service unavailable:', err.message)
    const lastRec = await recommendationRepo.findLatestByLandId(landId)
    if (lastRec) {
      return { ...lastRec, fromCache: false, fromFallback: true }
    }
    throw createError('Recommendation service is temporarily unavailable', 503)
  }

  const data = mlResponse.data
  const capacity = Math.round(land.areaInAcres * data.trees_per_acre)

  const recommendation = await recommendationRepo.create({
    landId,
    treeSpecies: data.all_species,
    capacity,
    confidence: data.confidence,
    rawResponse: data,
  })

  // Cache the result
  await set(cacheKey, {
    treeSpecies: data.all_species,
    primarySpecies: data.primary_species,
    capacity,
    confidence: data.confidence,
    treesPerAcre: data.trees_per_acre,
  }, CACHE_TTL)

  return { ...recommendation, fromCache: false, fromFallback: false }
}

const getHistory = async (landId) => {
  const land = await landRepo.findById(landId)
  if (!land) throw createError('Land not found', 404)
  return recommendationRepo.findByLandId(landId)
}

const getCircuitStatus = () => ({
  state: mlBreaker.getState(),
  failureCount: mlBreaker.failureCount,
})

// Helpers to estimate climate inputs from zone
const _estimateTemp = (zone) => ({
  TROPICAL: 28, SUBTROPICAL: 24, TEMPERATE: 15,
  ARID: 35, SEMIARID: 30, HIGHLAND: 10,
}[zone] || 22)

const _estimateRainfall = (zone) => ({
  TROPICAL: 2000, SUBTROPICAL: 1200, TEMPERATE: 800,
  ARID: 250, SEMIARID: 500, HIGHLAND: 1000,
}[zone] || 1000)

module.exports = { getRecommendation, getHistory, getCircuitStatus }