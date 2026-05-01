const prisma = require('../config/prisma')
const { get, set, buildKey } = require('../utils/cache')

const STATS_TTL = 10 * 60 // 10 minutes
const STATS_CACHE_KEY = 'stats:global'

const getGlobalStats = async () => {
  const cached = await get(STATS_CACHE_KEY)
  if (cached) return { ...cached, fromCache: true }

  // Single query using CTEs — no N+1
  const result = await prisma.$queryRaw`
    WITH plantation_stats AS (
      SELECT
        COUNT(*)                                            AS total_plantations,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')       AS completed_plantations,
        COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')     AS active_plantations,
        COALESCE(SUM("treesPlanted"), 0)                   AS total_trees_planted
      FROM plantations
    ),
    land_stats AS (
      SELECT
        COUNT(*)                                            AS total_lands,
        COUNT(*) FILTER (WHERE status = 'VERIFIED')        AS verified_lands,
        COALESCE(SUM("areaInAcres"), 0)                    AS total_area_acres
      FROM lands
    ),
    user_stats AS (
      SELECT
        COUNT(*)                                            AS total_users,
        COUNT(*) FILTER (WHERE role = 'VOLUNTEER')         AS total_volunteers,
        COUNT(*) FILTER (WHERE role = 'LANDOWNER')         AS total_landowners
      FROM users
    ),
    top_contributors AS (
      SELECT
        u.id,
        u.name,
        COUNT(p.id)                                        AS plantation_count,
        COALESCE(SUM(p."treesPlanted"), 0)                 AS trees_planted
      FROM users u
      LEFT JOIN plantations p ON p."createdById" = u.id
      GROUP BY u.id, u.name
      ORDER BY trees_planted DESC
      LIMIT 5
    ),
    monthly_trend AS (
      SELECT
        DATE_TRUNC('month', "createdAt")                   AS month,
        COUNT(*)                                            AS plantations_created,
        COALESCE(SUM("treesPlanted"), 0)                   AS trees_planted
      FROM plantations
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    )
    SELECT
      row_to_json(ps)   AS plantation_stats,
      row_to_json(ls)   AS land_stats,
      row_to_json(us)   AS user_stats,
      (SELECT json_agg(tc) FROM top_contributors tc) AS top_contributors,
      (SELECT json_agg(mt) FROM monthly_trend mt)    AS monthly_trend
    FROM plantation_stats ps, land_stats ls, user_stats us
  `

  const raw = result[0]
  const stats = {
    plantations: {
      total: Number(raw.plantation_stats.total_plantations),
      completed: Number(raw.plantation_stats.completed_plantations),
      active: Number(raw.plantation_stats.active_plantations),
      treesPlanted: Number(raw.plantation_stats.total_trees_planted),
    },
    lands: {
      total: Number(raw.land_stats.total_lands),
      verified: Number(raw.land_stats.verified_lands),
      totalAreaAcres: Number(raw.land_stats.total_area_acres),
    },
    users: {
      total: Number(raw.user_stats.total_users),
      volunteers: Number(raw.user_stats.total_volunteers),
      landowners: Number(raw.user_stats.total_landowners),
    },
    topContributors: (raw.top_contributors || []).map((c) => ({
      id: c.id,
      name: c.name,
      plantationCount: Number(c.plantation_count),
      treesPlanted: Number(c.trees_planted),
    })),
    monthlyTrend: (raw.monthly_trend || []).map((m) => ({
      month: m.month,
      plantationsCreated: Number(m.plantations_created),
      treesPlanted: Number(m.trees_planted),
    })),
    generatedAt: new Date().toISOString(),
  }

  await set(STATS_CACHE_KEY, stats, STATS_TTL)
  return { ...stats, fromCache: false }
}

const getLandStats = async (landId) => {
  const cacheKey = buildKey('stats', 'land', landId)
  const cached = await get(cacheKey)
  if (cached) return { ...cached, fromCache: true }

  const result = await prisma.$queryRaw`
    SELECT
      COUNT(p.id)                                         AS total_plantations,
      COUNT(p.id) FILTER (WHERE p.status = 'COMPLETED')  AS completed,
      COALESCE(SUM(p."treesPlanted"), 0)                  AS total_trees,
      COALESCE(AVG(r.rating), 0)                          AS avg_rating,
      COUNT(DISTINCT r.id)                                AS total_reviews
    FROM lands l
    LEFT JOIN plantations p ON p."landId" = l.id
    LEFT JOIN reviews r ON r."plantationId" = p.id
    WHERE l.id = ${landId}
    GROUP BY l.id
  `

  const raw = result[0] || {}
  const stats = {
    landId,
    totalPlantations: Number(raw.total_plantations || 0),
    completedPlantations: Number(raw.completed || 0),
    totalTreesPlanted: Number(raw.total_trees || 0),
    averageRating: parseFloat(Number(raw.avg_rating || 0).toFixed(2)),
    totalReviews: Number(raw.total_reviews || 0),
  }

  await set(cacheKey, stats, STATS_TTL)
  return { ...stats, fromCache: false }
}

module.exports = { getGlobalStats, getLandStats }   