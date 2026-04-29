const plantationRepo = require('../repositories/plantation.repository')
const landRepo = require('../repositories/land.repository')
const { uploadStream, deleteImage: deleteFromCloudinary } = require('../config/cloudinary')
const { del, delByPattern } = require('../utils/cache')
const { createError } = require('../middleware/errorHandler')

const STATS_CACHE_KEY = 'stats:global'

const create = async (data, files, userId) => {
  const land = await landRepo.findById(data.landId)
  if (!land) throw createError('Land not found', 404)
  if (land.status !== 'VERIFIED') throw createError('Land must be verified to create a plantation', 400)

  const plantation = await plantationRepo.create({ ...data, createdById: userId })

  if (files && files.length > 0) {
    const uploaded = await _uploadImages(files, `terraspotter/plantations/${plantation.id}`)
    await plantationRepo.addImages(uploaded.map((u) => ({
      url: u.secure_url,
      publicId: u.public_id,
      plantationId: plantation.id,
    })))
  }

  await del(STATS_CACHE_KEY)
  return plantationRepo.findById(plantation.id)
}

const getOne = async (id) => {
  const plantation = await plantationRepo.findById(id)
  if (!plantation) throw createError('Plantation not found', 404)
  return plantation
}

const list = async (query) => {
  const { cursor, limit, status, landId } = query
  return plantationRepo.findWithCursor({ cursor, limit, status, landId })
}

const listMine = async (query, userId) => {
  const { cursor, limit, status } = query
  return plantationRepo.findWithCursor({ cursor, limit, status, userId })
}

const update = async (id, data, userId, userRole) => {
  const plantation = await plantationRepo.findById(id)
  if (!plantation) throw createError('Plantation not found', 404)
  if (plantation.createdById !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }
  await del(STATS_CACHE_KEY)
  return plantationRepo.update(id, data)
}

const updateStatus = async (id, status, userId, userRole) => {
  const plantation = await plantationRepo.findById(id)
  if (!plantation) throw createError('Plantation not found', 404)
  if (plantation.createdById !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }

  const validTransitions = {
    CREATED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: [],
  }

  if (!validTransitions[plantation.status].includes(status)) {
    throw createError(
      `Cannot transition from ${plantation.status} to ${status}`,
      400
    )
  }

  const updateData = { status }
  if (status === 'COMPLETED') updateData.completedAt = new Date()

  await del(STATS_CACHE_KEY)
  return plantationRepo.update(id, updateData)
}

const uploadImages = async (id, files, userId, userRole) => {
  const plantation = await plantationRepo.findById(id)
  if (!plantation) throw createError('Plantation not found', 404)
  if (plantation.createdById !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }
  if (!files || files.length === 0) throw createError('No images provided', 400)

  const uploaded = await _uploadImages(files, `terraspotter/plantations/${id}`)
  await plantationRepo.addImages(uploaded.map((u) => ({
    url: u.secure_url,
    publicId: u.public_id,
    plantationId: id,
  })))

  return plantationRepo.findById(id)
}

const deleteImage = async (imageId, userId, userRole) => {
  const image = await plantationRepo.findImageById(imageId)
  if (!image) throw createError('Image not found', 404)

  const plantation = await plantationRepo.findById(image.plantationId)
  if (plantation.createdById !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }

  await deleteFromCloudinary(image.publicId).catch(() => {})
  return plantationRepo.deleteImage(imageId)
}

const addReview = async (plantationId, data, userId) => {
  const plantation = await plantationRepo.findById(plantationId)
  if (!plantation) throw createError('Plantation not found', 404)
  if (plantation.status !== 'COMPLETED') {
    throw createError('Can only review completed plantations', 400)
  }
  if (plantation.createdById === userId) {
    throw createError('Cannot review your own plantation', 400)
  }

  const existing = await plantationRepo.findReviewByUserAndPlantation(userId, plantationId)
  if (existing) throw createError('You have already reviewed this plantation', 409)

  return plantationRepo.createReview({ ...data, plantationId, userId })
}

const _uploadImages = (files, folder) => {
  return Promise.all(files.map((f) => uploadStream(f.buffer, folder)))
}

module.exports = { create, getOne, list, listMine, update, updateStatus, uploadImages, deleteImage, addReview }