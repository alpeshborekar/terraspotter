const landRepo = require('../repositories/land.repository')
const { uploadStream, deleteImage: deleteFromCloudinary } = require('../config/cloudinary')
const { createError } = require('../middleware/errorHandler')

const createLand = async (data, files, userId) => {
  const land = await landRepo.createLand({ ...data, ownerId: userId })

  if (files && files.length > 0) {
    const uploaded = await _uploadImages(files, `terraspotter/lands/${land.id}`)
    await landRepo.addImages(uploaded.map((u) => ({
      url: u.secure_url,
      publicId: u.public_id,
      landId: land.id,
    })))
  }

  return landRepo.findById(land.id)
}

const getLand = async (id) => {
  const land = await landRepo.findById(id)
  if (!land) throw createError('Land not found', 404)
  return land
}

const listLands = async (query) => {
  const { cursor, limit, status } = query
  return landRepo.findWithCursor({ cursor, limit, status })
}

const listMyLands = async (query, userId) => {
  const { cursor, limit, status } = query
  return landRepo.findWithCursor({ cursor, limit, status, ownerId: userId })
}

const updateLand = async (id, data, userId, userRole) => {
  const land = await landRepo.findById(id)
  if (!land) throw createError('Land not found', 404)
  if (land.ownerId !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }
  return landRepo.updateLand(id, data)
}

const deleteLand = async (id, userId, userRole) => {
  const land = await landRepo.findById(id)
  if (!land) throw createError('Land not found', 404)
  if (land.ownerId !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }

  // Delete all images from Cloudinary first
  for (const img of land.images) {
    await deleteFromCloudinary(img.publicId).catch(() => {})
  }

  return landRepo.deleteLand(id)
}

const uploadLandImages = async (landId, files, userId, userRole) => {
  const land = await landRepo.findById(landId)
  if (!land) throw createError('Land not found', 404)
  if (land.ownerId !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }
  if (!files || files.length === 0) throw createError('No images provided', 400)

  const uploaded = await _uploadImages(files, `terraspotter/lands/${landId}`)
  await landRepo.addImages(uploaded.map((u) => ({
    url: u.secure_url,
    publicId: u.public_id,
    landId,
  })))

  return landRepo.findById(landId)
}

const deleteLandImage = async (imageId, userId, userRole) => {
  const image = await landRepo.findImageById(imageId)
  if (!image) throw createError('Image not found', 404)

  const land = await landRepo.findById(image.landId)
  if (land.ownerId !== userId && userRole !== 'ADMIN') {
    throw createError('Forbidden', 403)
  }

  await deleteFromCloudinary(image.publicId).catch(() => {})
  return landRepo.deleteImage(imageId)
}

const verifyLand = async (id, data) => {
  const land = await landRepo.findById(id)
  if (!land) throw createError('Land not found', 404)
  return landRepo.updateLand(id, { status: data.status })
}

const getNearbyLands = async ({ latitude, longitude, radiusKm }) => {
  return landRepo.findNearby(latitude, longitude, radiusKm)
}

// Private: upload multiple images in parallel
const _uploadImages = (files, folder) => {
  return Promise.all(files.map((f) => uploadStream(f.buffer, folder)))
}

module.exports = {
  createLand,
  getLand,
  listLands,
  listMyLands,
  updateLand,
  deleteLand,
  uploadLandImages,
  deleteLandImage,
  verifyLand,
  getNearbyLands,
}