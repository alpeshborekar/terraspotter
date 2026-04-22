const prisma = require('../config/prisma')

const createLand = (data) => {
  return prisma.land.create({
    data,
    include: { images: true, owner: { select: { id: true, name: true, email: true } } },
  })
}

const findById = (id) => {
  return prisma.land.findUnique({
    where: { id },
    include: {
      images: true,
      owner: { select: { id: true, name: true, email: true } },
      recommendations: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
}

const findWithCursor = async ({ cursor, limit, status, ownerId }) => {
  const where = {}
  if (status) where.status = status
  if (ownerId) where.ownerId = ownerId

  const items = await prisma.land.findMany({
    where,
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    include: {
      images: { take: 1 },
      owner: { select: { id: true, name: true } },
    },
  })

  let nextCursor = null
  if (items.length > limit) {
    const nextItem = items.pop()
    nextCursor = nextItem.id
  }

  return { items, nextCursor }
}

const updateLand = (id, data) => {
  return prisma.land.update({
    where: { id },
    data,
    include: { images: true },
  })
}

const deleteLand = (id) => {
  return prisma.land.delete({ where: { id } })
}

const addImages = (images) => {
  return prisma.landImage.createMany({ data: images })
}

const deleteImage = (id) => {
  return prisma.landImage.delete({ where: { id } })
}

const findImageById = (id) => {
  return prisma.landImage.findUnique({ where: { id } })
}

// Raw SQL for Haversine geospatial query
const findNearby = (latitude, longitude, radiusKm) => {
  return prisma.$queryRaw`
    SELECT
      l.id,
      l.title,
      l.latitude,
      l.longitude,
      l."areaInAcres",
      l."soilType",
      l."climateZone",
      l.status,
      l."createdAt",
      ROUND(
        (6371 * acos(
          LEAST(1.0, cos(radians(${latitude}))
          * cos(radians(l.latitude))
          * cos(radians(l.longitude) - radians(${longitude}))
          + sin(radians(${latitude}))
          * sin(radians(l.latitude)))
        ))::numeric, 2
      ) AS distance_km
    FROM lands l
    WHERE l.status = 'VERIFIED'
    HAVING ROUND(
      (6371 * acos(
        LEAST(1.0, cos(radians(${latitude}))
        * cos(radians(l.latitude))
        * cos(radians(l.longitude) - radians(${longitude}))
        + sin(radians(${latitude}))
        * sin(radians(l.latitude)))
      ))::numeric, 2
    ) <= ${radiusKm}
    ORDER BY distance_km ASC
    LIMIT 20
  `
}

module.exports = {
  createLand,
  findById,
  findWithCursor,
  updateLand,
  deleteLand,
  addImages,
  deleteImage,
  findImageById,
  findNearby,
}