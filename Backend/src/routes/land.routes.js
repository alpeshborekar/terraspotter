const router = require('express').Router()
const controller = require('../controllers/land.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')
const validate = require('../middleware/validate')
const upload = require('../middleware/upload')
const {
  createLandSchema,
  updateLandSchema,
  nearbySchema,
  verifyLandSchema,
  paginationSchema,
} = require('../validators/land.validators')

// Public
router.get('/', validate(paginationSchema), controller.listLands)
router.get('/nearby', validate(nearbySchema), controller.getNearby)
router.get('/:id', controller.getLand)

// Landowner + Admin
router.post(
  '/',
  authenticate,
  authorize('LANDOWNER', 'ADMIN'),
  upload.array('images', 5),
  validate(createLandSchema),
  controller.createLand
)

router.patch(
  '/:id',
  authenticate,
  authorize('LANDOWNER', 'ADMIN'),
  validate(updateLandSchema),
  controller.updateLand
)

router.delete('/:id', authenticate, authorize('LANDOWNER', 'ADMIN'), controller.deleteLand)

router.post(
  '/:id/images',
  authenticate,
  authorize('LANDOWNER', 'ADMIN'),
  upload.array('images', 5),
  controller.uploadImages
)

router.delete('/:id/images/:imageId', authenticate, authorize('LANDOWNER', 'ADMIN'), controller.deleteImage)

// My lands
router.get('/user/me', authenticate, validate(paginationSchema), controller.listMyLands)

// Admin only
router.patch('/:id/verify', authenticate, authorize('ADMIN'), validate(verifyLandSchema), controller.verifyLand)

module.exports = router 