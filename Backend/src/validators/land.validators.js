const { z } = require('zod')

const createLandSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  areaInAcres: z.coerce.number().positive('Area must be a positive number'),
  soilType: z.enum(['CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY']),
  climateZone: z.enum(['TROPICAL', 'SUBTROPICAL', 'TEMPERATE', 'ARID', 'SEMIARID', 'HIGHLAND']),
})

const updateLandSchema = createLandSchema.partial()

const nearbySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().default(50),
})

const verifyLandSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  reason: z.string().optional(),
})

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
})

module.exports = {
  createLandSchema,
  updateLandSchema,
  nearbySchema,
  verifyLandSchema,
  paginationSchema,
}