import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@red-desert/db'
import { createClient } from '@/lib/supabase/server'

const VALID_TYPES   = ['BELL', 'ARTIFACT', 'TABLET', 'BOSS_SPAWN', 'NPC', 'DUNGEON', 'VIEWPOINT']
const VALID_REGIONS = ['PYWEL_CASTLE', 'THORNWOOD', 'ASHEN_WASTES', 'FROZEN_HIGHLANDS', 'VERDANT_COAST']

/**
 * POST /api/contribute/marker
 * 지도 마커 제보 — isVerified=false로 생성, 관리자 승인 후 공개
 *
 * Body: { type, region, x, y, nameKo, nameEn, isMissable?, notes? }
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, region, x, y, nameKo, nameEn, isMissable = false, notes } =
    body as Record<string, unknown>

  if (!type || !region || !nameKo || !nameEn || x == null || y == null) {
    return NextResponse.json(
      { error: 'type, region, x, y, nameKo, nameEn 은 필수입니다.' },
      { status: 400 }
    )
  }
  if (!VALID_TYPES.includes(type as string))
    return NextResponse.json({ error: '유효하지 않은 type 값입니다.' }, { status: 400 })
  if (!VALID_REGIONS.includes(region as string))
    return NextResponse.json({ error: '유효하지 않은 region 값입니다.' }, { status: 400 })

  const nx = Number(x), ny = Number(y)
  if (!Number.isFinite(nx) || !Number.isFinite(ny) || nx < 0 || nx > 2000 || ny < 0 || ny > 2000)
    return NextResponse.json({ error: 'x, y는 0~2000 범위여야 합니다.' }, { status: 400 })

  let userId: string | null = null
  let contributor: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
    contributor = userId
  } catch { /* 미로그인 허용 */ }

  // 중복 제보 방지: 같은 타입 + 지역에 50px 이내 미검증 마커가 있으면 거절
  const nearby = await prisma.mapMarker.findFirst({
    where: {
      type: type as never,
      region: region as never,
      isVerified: false,
      x: { gte: nx - 50, lte: nx + 50 },
      y: { gte: ny - 50, lte: ny + 50 },
    },
  })
  if (nearby) {
    return NextResponse.json({ error: '해당 위치 근처에 이미 제보된 마커가 있습니다.' }, { status: 409 })
  }

  try {
    const marker = await prisma.mapMarker.create({
      data: {
        type: type as never,
        region: region as never,
        x: nx, y: ny,
        nameKo: nameKo as string,
        nameEn: nameEn as string,
        isMissable: Boolean(isMissable),
        notes: (notes as string | null) ?? null,
        isVerified: false,
        contributor,
      },
    })

    // Contribution 로그
    await prisma.contribution.create({
      data: {
        type: 'MAP_MARKER',
        targetId: marker.id,
        userId,
        data: { markerId: marker.id, type, region, x: nx, y: ny },
      },
    })

    return NextResponse.json({ ok: true, markerId: marker.id })
  } catch (error) {
    console.error('[contribute/marker]', error)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
