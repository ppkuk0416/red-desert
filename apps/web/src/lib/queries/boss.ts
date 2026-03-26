import { prisma } from '@red-desert/db'
import type { Region } from '@red-desert/db'
import type { BossCardData } from '@red-desert/ui/boss/card'

type BossListFilter = {
  q?: string
  region?: string
  difficulty?: number
}

export async function getBossList(filter: BossListFilter): Promise<BossCardData[]> {
  const bosses = await prisma.boss.findMany({
    where: {
      ...(filter.q && {
        OR: [
          { nameKo: { contains: filter.q, mode: 'insensitive' } },
          { nameEn: { contains: filter.q, mode: 'insensitive' } },
        ],
      }),
      ...(filter.region && { region: filter.region as Region }),
      ...(filter.difficulty && { difficulty: filter.difficulty }),
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
