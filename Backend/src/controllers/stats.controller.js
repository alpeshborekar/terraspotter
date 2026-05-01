const statsService = require('../services/stats.service')

const getGlobal = async (req, res, next) => {
  try {
    const stats = await statsService.getGlobalStats()
    res.json({ success: true, data: stats })
  } catch (err) { next(err) }
}

const getLandStats = async (req, res, next) => {
  try {
    const stats = await statsService.getLandStats(req.params.landId)
    res.json({ success: true, data: stats })
  } catch (err) { next(err) }
}

module.exports = { getGlobal, getLandStats }