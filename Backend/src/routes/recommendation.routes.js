const router = require('express').Router()
const controller = require('../controllers/recommendation.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

// Get recommendation for a land (authenticated)
router.get('/lands/:landId', authenticate, controller.getRecommendation)

// Get recommendation history for a land
router.get('/lands/:landId/history', authenticate, controller.getHistory)

// Admin: check circuit breaker status
router.get('/circuit-status', authenticate, authorize('ADMIN'), controller.getCircuitStatus)

module.exports = router