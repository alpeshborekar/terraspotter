const router = require('express').Router()
const controller = require('../controllers/stats.controller')

router.get('/global', controller.getGlobal)
router.get('/lands/:landId', controller.getLandStats)

module.exports = router