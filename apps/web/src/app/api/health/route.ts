import { NextResponse } from 'next/server'
import { prisma } from '@red-desert/db'

/**
 * GET /api/health
 * DB 연결 + 기본 통계 확인
 *
 * 로컬 개발: curl http://localhost:3000/api/health
 * 응답 예시:
 * {
 *   "status": "ok",
 *   "db": "connected",
 *   "counts": { "bosses": 5, "items": 5 },
 *   "timestamp": "2026-03-26T..."
 * }
 */
export async function GET() {
  try {
    const [bossCount, itemCount] = await Promise.all([
      prisma.boss.count(),
      prisma.item.count(),
    ])

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      counts: {
        bosses: bossCount,
        items: itemCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        error: message,
        hint: '.env.local의 DATABASE_URL을 확인하세요.',
      },
      { status: 503 },
    )
  }
}
