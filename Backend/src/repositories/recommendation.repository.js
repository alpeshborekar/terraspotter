const prisma = require('../config/prisma')

const create = (data) => {
  return prisma.landRecommendation.create({ data })
}

const findByLandId = (landId) => {
  return prisma.landRecommendation.findMany({
    where: { landId },
    orderBy: { createdAt: 'desc' },
  })
}

const findLatestByLandId = (landId) => {
  return prisma.landRecommendation.findFirst({
    where: { landId },
    orderBy: { createdAt: 'desc' },
  })
}

module.exports = { create, findByLandId, findLatestByLandId }