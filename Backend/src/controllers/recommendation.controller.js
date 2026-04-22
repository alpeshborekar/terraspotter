const recommendationService = require('../services/recommendation.service')

const getRecommendation = async (req, res, next) => {
  try {
    const result = await recommendationService.getRecommendation(req.params.landId)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const getHistory = async (req, res, next) => {
  try {
    const history = await recommendationService.getHistory(req.params.landId)
    res.json({ success: true, data: history })
  } catch (err) { next(err) }
}

const getCircuitStatus = async (req, res, next) => {
  try {
    const status = recommendationService.getCircuitStatus()
    res.json({ success: true, data: status })
  } catch (err) { next(err) }
}

module.exports = { getRecommendation, getHistory, getCircuitStatus }