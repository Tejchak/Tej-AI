import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days in seconds

export async function getCachedResponse(query: string): Promise<string | null> {
  try {
    const normalizedQuery = normalizeQuery(query)
    const cachedResponse = await redis.get(`chat:${normalizedQuery}`)
    return cachedResponse as string | null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function setCachedResponse(query: string, response: string): Promise<void> {
  try {
    const normalizedQuery = normalizeQuery(query)
    await redis.set(`chat:${normalizedQuery}`, response, { ex: CACHE_TTL })
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

// Helper function to normalize queries for consistent cache keys
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, '') // Remove special characters
}
