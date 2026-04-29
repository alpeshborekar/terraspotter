const router = require('express').Router()
const controller = require('../controllers/plantation.controller')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')
const validate = require('../middleware/validate')
const upload = require('../middleware/upload')
const {
  createPlantationSchema,
  updatePlantationSchema,
  updateStatusSchema,
  createReviewSchema,
  paginationSchema,
} = require('../validators/plantation.validators')

// Public
router.get('/', validate(paginationSchema), controller.list)
router.get('/:id', controller.getOne)

// Authenticated
router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  validate(createPlantationSchema),
  controller.create
)

router.patch(
  '/:id',
  authenticate,
  validate(updatePlantationSchema),
  controller.update
)

router.patch(
  '/:id/status',
  authenticate,
  validate(updateStatusSchema),
  controller.updateStatus
)

router.post(
  '/:id/images',
  authenticate,
  upload.array('images', 5),
  controller.uploadImages
)

router.delete(
  '/:id/images/:imageId',
  authenticate,
  controller.deleteImage
)

router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  controller.addReview
)

router.get('/user/me', authenticate, validate(paginationSchema), controller.listMine)

module.exports = router