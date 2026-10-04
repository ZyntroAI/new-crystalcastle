// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const region = request.headers.get('x-vercel-ip-country') || 'unknown'

  // Example dependency check
  const dbHealthy = await checkDatabase()
  const redisHealthy = await checkRedis()

  const overallHealthy = dbHealthy && redisHealthy

  return NextResponse.json({
    status: overallHealthy ? 'healthy' : 'unhealthy',
    region,
    dependencies: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy'
    },
    timestamp: new Date().toISOString()
  }, { status: overallHealthy ? 200 : 503 })
}
