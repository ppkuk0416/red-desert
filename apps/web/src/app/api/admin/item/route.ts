import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@red-desert/db'
import { upsertItemToSearch } from '@/lib/search/sync'

function auth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

const VALID_CATEGORIES = ['WEAPON', 'ARMOR', 'MATERIAL', 'CONSUMABLE', 'ABYSS_ARTIFACT', 'COLLECTIBLE', 'QUEST', 'TRADE_GOOD']
const VALID_RARITIES   = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']

/**
 * GET /api/admin/item
 * POST /api/admin/item — 아이템 upsert by slug
 */
export async function GET(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.item.findMany({
    orderBy: [{ rarity: 'desc' }, { nameKo: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    slug, nameKo, nameEn, category, rarity = 'COMMON',
    descriptionKo, descriptionEn, iconUrl,
  } = body as Record<string, unknown>

  if (!slug || !nameKo || !nameEn || !category) {
    return NextResponse.json(
      { error: 'slug, nameKo, nameEn, category 는 필수입니다.' },
      { status: 400 }
    )
  }
  if (!VALID_CATEGORIES.includes(category as string)) {
    return NextResponse.json({ error: '유효하지 않은 category 값입니다.' }, { status: 400 })
  }
  if (!VALID_RARITIES.includes(rarity as string)) {
    return NextResponse.json({ error: '유효하지 않은 rarity 값입니다.' }, { status: 400 })
  }

  try {
    const item = await prisma.item.upsert({
      where: { slug: slug as string },
      update: {
        nameKo: nameKo as string,
        nameEn: nameEn as string,
        category: category as never,
        rarity: rarity as never,
        descriptionKo: (descriptionKo as string | null) ?? null,
        descriptionEn: (descriptionEn as string | null) ?? null,
        iconUrl: (iconUrl as string | null) ?? null,
      },
      create: {
        slug: slug as string,
        nameKo: nameKo as string,
        nameEn: nameEn as string,
        category: category as never,
        rarity: rarity as never,
        descriptionKo: (descriptionKo as string | null) ?? null,
        descriptionEn: (descriptionEn as string | null) ?? null,
        iconUrl: (iconUrl as string | null) ?? null,
      },
    })

    await upsertItemToSearch(item.id).catch(console.error)

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error('[admin/item POST]', error)
    return NextResponse.json({ error: 'DB 저장 실패' }, { status: 500 })
  }
}
