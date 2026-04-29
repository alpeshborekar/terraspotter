const plantationService = require('../services/plantation.service')

const create = async (req, res, next) => {
  try {
    const result = await plantationService.create(req.body, req.files, req.user.id)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}

const getOne = async (req, res, next) => {
  try {
    const result = await plantationService.getOne(req.params.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const list = async (req, res, next) => {
  try {
    const result = await plantationService.list(req.query)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const listMine = async (req, res, next) => {
  try {
    const result = await plantationService.listMine(req.query, req.user.id)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const result = await plantationService.update(req.params.id, req.body, req.user.id, req.user.role)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const updateStatus = async (req, res, next) => {
  try {
    const result = await plantationService.updateStatus(req.params.id, req.body.status, req.user.id, req.user.role)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const uploadImages = async (req, res, next) => {
  try {
    const result = await plantationService.uploadImages(req.params.id, req.files, req.user.id, req.user.role)
    res.json({ success: true, data: result })
  } catch (err) { next(err) }
}

const deleteImage = async (req, res, next) => {
  try {
    await plantationService.deleteImage(req.params.imageId, req.user.id, req.user.role)
    res.json({ success: true, message: 'Image deleted' })
  } catch (err) { next(err) }
}

const addReview = async (req, res, next) => {
  try {
    const result = await plantationService.addReview(req.params.id, req.body, req.user.id)
    res.status(201).json({ success: true, data: result })
  } catch (err) { next(err) }
}

module.exports = { create, getOne, list, listMine, update, updateStatus, uploadImages, deleteImage, addReview }