const { z } = require('zod')

const createPlantationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  landId: z.string().uuid('Invalid land ID'),
  treesPlanted: z.coerce.number().int().min(0).default(0),
})

const updatePlantationSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  treesPlanted: z.coerce.number().int().min(0).optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
})

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['CREATED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  landId: z.string().uuid().optional(),
})

module.exports = {
  createPlantationSchema,
  updatePlantationSchema,
  updateStatusSchema,
  createReviewSchema,
  paginationSchema,
}