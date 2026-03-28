import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@red-desert/db'
import { upsertBossToSearch } from '@/lib/search/sync'

function auth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

/**
 * GET /api/admin/boss — 전체 보스 목록 (관리자용)
 * POST /api/admin/boss — 보스 생성/업데이트 (upsert by slug)
 */
export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bosses = await prisma.boss.findMany({
    include: { _count: { select: { drops: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(bosses)
}

export async function POST(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    slug, nameKo, nameEn, region, difficulty,
    mechanics = [], weaknesses = [], thumbnailUrl, videoUrl,
  } = body as Record<string, unknown>

  // 필수 필드 검증
  if (!slug || !nameKo || !nameEn || !region) {
    return NextResponse.json(
      { error: 'slug, nameKo, nameEn, region 은 필수입니다.' },
      { status: 400 }
    )
  }

  const VALID_REGIONS = ['PYWEL_CASTLE', 'THORNWOOD', 'ASHEN_WASTES', 'FROZEN_HIGHLANDS', 'VERDANT_COAST']
  if (!VALID_REGIONS.includes(region as string)) {
    return NextResponse.json({ error: '유효하지 않은 region 값입니다.' }, { status: 400 })
  }

  try {
    const boss = await prisma.boss.upsert({
      where: { slug: slug as string },
      update: {
        nameKo: nameKo as string,
        nameEn: nameEn as string,
        region: region as never,
        difficulty: Number(difficulty ?? 1),
        mechanics: (mechanics as string[]),
        weaknesses: (weaknesses as string[]),
        thumbnailUrl: (thumbnailUrl as string | null) ?? null,
        videoUrl: (videoUrl as string | null) ?? null,
      },
      create: {
        slug: slug as string,
        nameKo: nameKo as string,
        nameEn: nameEn as string,
        region: region as never,
        difficulty: Number(difficulty ?? 1),
        mechanics: (mechanics as string[]),
        weaknesses: (weaknesses as string[]),
        thumbnailUrl: (thumbnailUrl as string | null) ?? null,
        videoUrl: (videoUrl as string | null) ?? null,
      },
    })

    // Meilisearch 동기화 (에러 무시)
    await upsertBossToSearch(boss.id).catch(console.error)

    return NextResponse.json({ ok: true, boss })
  } catch (error) {
    console.error('[admin/boss POST]', error)
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 })
  }
}
