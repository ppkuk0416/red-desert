import { meiliAdmin, INDEX } from './client'
import { setupIndexes } from './indexes'
import { prisma } from '@red-desert/db'

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성', THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야', FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}
const MECHANIC_KO: Record<string, string> = {
  PARRY: '패리', COUNTER: '카운터', CLIMB: '등반',
  SUMMON: '소환', ELEMENTAL: '속성', MOUNTED: '마운트',
}
const WEAPON_KO: Record<string, string> = {
  SWORD_SHIELD: '검+방패', GREATSWORD: '대검', SPEAR: '창',
  DAGGER: '단검', BOW: '활', CROSSBOW: '석궁', STAFF: '지팡이',
  SCYTHE: '낫', HAMMER: '망치', FLAIL: '도리깨',
  TWIN_SWORDS: '쌍검', BARE_HANDS: '맨손', SPECIAL: '특수',
}
const CATEGORY_KO: Record<string, string> = {
  WEAPON: '무기', ARMOR: '방어구', MATERIAL: '재료',
  CONSUMABLE: '소비', ABYSS_ARTIFACT: '심연 유물',
  COLLECTIBLE: '수집품', QUEST: '퀘스트', TRADE_GOOD: '거래 상품',
}
const RARITY_KO: Record<string, string> = {
  COMMON: '일반', UNCOMMON: '고급', RARE: '희귀',
  EPIC: '영웅', LEGENDARY: '전설',
}

export async function syncAllToSearch() {
  await setupIndexes()

  // 보스
  const bosses = await prisma.boss.findMany({
    include: { drops: { include: { item: true } } },
  })

  await meiliAdmin.index(INDEX.BOSSES).addDocuments(
    bosses.map((b) => ({
      id: b.id, slug: b.slug,
      nameKo: b.nameKo, nameEn: b.nameEn,
      nameCombined: `${b.nameKo} ${b.nameEn}`,
      region: b.region, regionKo: REGION_KO[b.region] ?? b.region,
      difficulty: b.difficulty,
      mechanics: b.mechanics,
      mechanicsKo: b.mechanics.map((m) => MECHANIC_KO[m] ?? m),
      weaknesses: b.weaknesses,
      weaknessesKo: b.weaknesses.map((w) => WEAPON_KO[w] ?? w),
      thumbnailUrl: b.thumbnailUrl,
      dropItemNames: b.drops.flatMap((d) => [d.item.nameKo, d.item.nameEn]),
      type: 'boss' as const,
    })),
    { primaryKey: 'id' },
  )

  // 아이템
  const items = await prisma.item.findMany({
    include: {
      bossDrops: { include: { boss: true } },
      dropSources: true,
    },
  })

  await meiliAdmin.index(INDEX.ITEMS).addDocuments(
    items.map((item) => ({
      id: item.id, slug: item.slug,
      nameKo: item.nameKo, nameEn: item.nameEn,
      nameCombined: `${item.nameKo} ${item.nameEn}`,
      category: item.category, categoryKo: CATEGORY_KO[item.category] ?? item.category,
      rarity: item.rarity, rarityKo: RARITY_KO[item.rarity] ?? item.rarity,
      iconUrl: item.iconUrl,
      dropSourceNames: [
        ...item.bossDrops.flatMap((d) => [d.boss.nameKo, d.boss.nameEn]),
        ...item.dropSources.map((s) => s.sourceName),
      ],
      descriptionKo: item.descriptionKo,
      type: 'item' as const,
    })),
    { primaryKey: 'id' },
  )
}

/**
 * 보스 또는 아이템 단건 upsert
 * 새 데이터 입력 직후 호출해 실시간 반영
 */
export async function upsertBossToSearch(bossId: string) {
  const boss = await prisma.boss.findUniqueOrThrow({
    where: { id: bossId },
    include: { drops: { include: { item: true } } },
  })

  await meiliAdmin.index(INDEX.BOSSES).addDocuments([{
    id: boss.id, slug: boss.slug,
    nameKo: boss.nameKo, nameEn: boss.nameEn,
    nameCombined: `${boss.nameKo} ${boss.nameEn}`,
    region: boss.region, regionKo: REGION_KO[boss.region] ?? boss.region,
    difficulty: boss.difficulty,
    mechanics: boss.mechanics,
    mechanicsKo: boss.mechanics.map((m) => MECHANIC_KO[m] ?? m),
    weaknesses: boss.weaknesses,
    weaknessesKo: boss.weaknesses.map((w) => WEAPON_KO[w] ?? w),
    thumbnailUrl: boss.thumbnailUrl,
    dropItemNames: boss.drops.flatMap((d) => [d.item.nameKo, d.item.nameEn]),
    type: 'boss' as const,
  }], { primaryKey: 'id' })
}

export async function upsertItemToSearch(itemId: string) {
  const item = await prisma.item.findUniqueOrThrow({
    where: { id: itemId },
    include: { bossDrops: { include: { boss: true } }, dropSources: true },
  })

  await meiliAdmin.index(INDEX.ITEMS).addDocuments([{
    id: item.id, slug: item.slug,
    nameKo: item.nameKo, nameEn: item.nameEn,
    nameCombined: `${item.nameKo} ${item.nameEn}`,
    category: item.category, categoryKo: CATEGORY_KO[item.category] ?? item.category,
    rarity: item.rarity, rarityKo: RARITY_KO[item.rarity] ?? item.rarity,
    iconUrl: item.iconUrl,
    dropSourceNames: [
      ...item.bossDrops.flatMap((d) => [d.boss.nameKo, d.boss.nameEn]),
      ...item.dropSources.map((s) => s.sourceName),
    ],
    descriptionKo: item.descriptionKo,
    type: 'item' as const,
  }], { primaryKey: 'id' })
}
