import { prisma } from '@red-desert/db'
import type { ItemCategory, ItemRarity } from '@red-desert/db'
import type { ItemCardData } from '@red-desert/ui/item/card'

type ItemListFilter = {
  q?: string
  category?: string
  rarity?: string
}

export async function getItemList(filter: ItemListFilter): Promise<ItemCardData[]> {
  const items = await prisma.item.findMany({
    where: {
      ...(filter.q && {
        OR: [
          { nameKo: { contains: filter.q, mode: 'insensitive' } },
          { nameEn: { contains: filter.q, mode: 'insensitive' } },
        ],
      }),
      ...(filter.category && { category: filter.category as ItemCategory }),
      ...(filter.rarity && { rarity: filter.rarity as ItemRarity }),
    },
    include: {
      _count: {
        select: {
          dropSources: true,
          bossDrops: true,
          craftedFrom: true,
        },
      },
    },
    orderBy: [{ rarity: 'desc' }, { category: 'asc' }, { nameKo: 'asc' }],
  })

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    nameKo: item.nameKo,
    nameEn: item.nameEn,
    category: item.category,
    rarity: item.rarity,
    iconUrl: item.iconUrl,
    dropSourceCount: item._count.dropSources + item._count.bossDrops,
    isCraftable: item._count.craftedFrom > 0,
  }))
}

export async function getItemDetail(slug: string) {
  return prisma.item.findUnique({
    where: { slug },
    include: {
      // 보스 드랍 (역방향 조회)
      bossDrops: {
        include: {
          boss: {
            select: {
              id: true,
              slug: true,
              nameKo: true,
              nameEn: true,
              region: true,
              difficulty: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: { dropRate: 'desc' },
      },
      // 일반 드랍처
      dropSources: {
        orderBy: { sourceType: 'asc' },
      },
      // 이 아이템으로 만들 수 있는 것 (제작 결과물)
      craftedFrom: {
        include: {
          ingredients: {
            include: {
              item: {
                select: {
                  id: true,
                  slug: true,
                  nameKo: true,
                  nameEn: true,
                  rarity: true,
                  iconUrl: true,
                },
              },
            },
          },
        },
      },
      // 이 아이템이 재료로 쓰이는 레시피
      usedInCraft: {
        include: {
          recipe: {
            include: {
              outputItem: {
                select: {
                  id: true,
                  slug: true,
                  nameKo: true,
                  nameEn: true,
                  rarity: true,
                  iconUrl: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getAllItemSlugs(): Promise<string[]> {
  const items = await prisma.item.findMany({ select: { slug: true } })
  return items.map((i) => i.slug)
}
