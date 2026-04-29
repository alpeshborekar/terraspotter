const prisma = require('../config/prisma')

const create = (data) => {
  return prisma.plantation.create({
    data,
    include: {
      land: { select: { id: true, title: true, latitude: true, longitude: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  })
}

const findById = (id) => {
  return prisma.plantation.findUnique({
    where: { id },
    include: {
      land: { select: { id: true, title: true, latitude: true, longitude: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      images: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

const findWithCursor = async ({ cursor, limit, status, landId, userId }) => {
  const where = {}
  if (status) where.status = status
  if (landId) where.landId = landId
  if (userId) where.createdById = userId

  const items = await prisma.plantation.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      land: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      images: { take: 1 },
      _count: { select: { reviews: true } },
    },
  })

  let nextCursor = null
  if (items.length > limit) {
    const next = items.pop()
    nextCursor = next.id
  }

  return { items, nextCursor }
}

const update = (id, data) => {
  return prisma.plantation.update({
    where: { id },
    data,
    include: {
      land: { select: { id: true, title: true } },
      createdBy: { select: { id: true, name: true } },
      images: true,
    },
  })
}

const addImages = (images) => {
  return prisma.plantationImage.createMany({ data: images })
}

const findImageById = (id) => {
  return prisma.plantationImage.findUnique({ where: { id } })
}

const deleteImage = (id) => {
  return prisma.plantationImage.delete({ where: { id } })
}

const createReview = (data) => {
  return prisma.review.create({
    data,
    include: { user: { select: { id: true, name: true } } },
  })
}

const findReviewByUserAndPlantation = (userId, plantationId) => {
  return prisma.review.findFirst({ where: { userId, plantationId } })
}

module.exports = {
  create,
  findById,
  findWithCursor,
  update,
  addImages,
  findImageById,
  deleteImage,
  createReview,
  findReviewByUserAndPlantation,
}