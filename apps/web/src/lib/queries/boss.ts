import { prisma } from '@red-desert/db'
import type { Region } from '@red-desert/db'
import type { BossCardData } from '@red-desert/ui/boss/card'

const VALID_REGIONS: Region[] = [
  'PYWEL_CASTLE', 'THORNWOOD', 'ASHEN_WASTES', 'FROZEN_HIGHLANDS', 'VERDANT_COAST',
]

type BossListFilter = {
  q?: string
  region?: string
  difficulty?: number
}

export async function getBossList(filter: BossListFilter): Promise<BossCardData[]> {
  const region = VALID_REGIONS.includes(filter.region as Region)
    ? (filter.region as Region)
    : undefined
  const difficulty =
    filter.difficulty !== undefined &&
    Number.isInteger(filter.difficulty) &&
    filter.difficulty >= 1 &&
    filter.difficulty <= 5
      ? filter.difficulty
      : undefined

  const bosses = await prisma.boss.findMany({
    where: {
      ...(filter.q && {
        OR: [
          { nameKo: { contains: filter.q, mode: 'insensitive' } },
          { nameEn: { contains: filter.q, mode: 'insensitive' } },
        ],
      }),
      ...(region && { region }),
      ...(difficulty && { difficulty }),
    },
    include: {
      _count: { select: { drops: true } },
    },
    orderBy: [{ region: 'asc' }, { difficulty: 'asc' }],
  })

  return bosses.map((b) => ({
    id: b.id,
    slug: b.slug,
    nameKo: b.nameKo,
    nameEn: b.nameEn,
    region: b.region,
    difficulty: b.difficulty,
    thumbnailUrl: b.thumbnailUrl,
    weaknesses: b.weaknesses,
    mechanics: b.mechanics,
    communityRating: b.communityRating,
    dropCount: b._count.drops,
  }))
}

export async function getBossDetail(slug: string) {
  return prisma.boss.findUnique({
    where: { slug },
    include: {
      drops: {
        include: {
          item: {
            select: {
              id: true,
              slug: true,
              nameKo: true,
              nameEn: true,
              rarity: true,
              category: true,
              iconUrl: true,
            },
          },
        },
        orderBy: { isGuaranteed: 'desc' },
      },
      mapMarkers: true,
    },
  })
}

export async function getAllBossSlugs(): Promise<string[]> {
  const bosses = await prisma.boss.findMany({ select: { slug: true } })
  return bosses.map((b) => b.slug)
}
