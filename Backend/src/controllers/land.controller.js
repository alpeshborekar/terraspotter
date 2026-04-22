const landService = require('../services/land.service')

const createLand = async (req, res, next) => {
  try {
    const land = await landService.createLand(req.body, req.files, req.user.id)
    res.status(201).json({ success: true, data: land })
  } catch (err) { next(err) }
}

const getLand = async (req, res, next) => {
  try {
    const land = await landService.getLand(req.params.id)
    res.json({ success: true, data: land })
  } catch (err) { next(err) }
}

const listLands = async (req, res, next) => {
  try {
    const result = await landService.listLands(req.query)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const listMyLands = async (req, res, next) => {
  try {
    const result = await landService.listMyLands(req.query, req.user.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const updateLand = async (req, res, next) => {
  try {
    const land = await landService.updateLand(req.params.id, req.body, req.user.id, req.user.role)
    res.json({ success: true, data: land })
  } catch (err) { next(err) }
}

const deleteLand = async (req, res, next) => {
  try {
    await landService.deleteLand(req.params.id, req.user.id, req.user.role)
    res.json({ success: true, message: 'Land deleted successfully' })
  } catch (err) { next(err) }
}

const uploadImages = async (req, res, next) => {
  try {
    const land = await landService.uploadLandImages(req.params.id, req.files, req.user.id, req.user.role)
    res.json({ success: true, data: land })
  } catch (err) { next(err) }
}

const deleteImage = async (req, res, next) => {
  try {
    await landService.deleteLandImage(req.params.imageId, req.user.id, req.user.role)
    res.json({ success: true, message: 'Image deleted successfully' })
  } catch (err) { next(err) }
}

const verifyLand = async (req, res, next) => {
  try {
    const land = await landService.verifyLand(req.params.id, req.body)
    res.json({ success: true, data: land })
  } catch (err) { next(err) }
}

const getNearby = async (req, res, next) => {
  try {
    const lands = await landService.getNearbyLands(req.query)
    res.json({ success: true, data: lands })
  } catch (err) { next(err) }
}

module.exports = {
  createLand, getLand, listLands, listMyLands,
  updateLand, deleteLand, uploadImages, deleteImage,
  verifyLand, getNearby,
}