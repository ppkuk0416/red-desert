import { MeiliSearch } from 'meilisearch'
import { PrismaClient } from '@prisma/client'
import { setupIndexes } from '../apps/web/src/lib/search/indexes'

// tools/scripts에서 직접 실행하므로 경로 직접 참조
const prisma = new PrismaClient()
const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY ?? '',
})

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
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

async function syncBosses() {
  const bosses = await prisma.boss.findMany({
    include: { drops: { include: { item: true } } },
  })

  const docs = bosses.map((b) => ({
    id: b.id,
    slug: b.slug,
    nameKo: b.nameKo,
    nameEn: b.nameEn,
    nameCombined: `${b.nameKo} ${b.nameEn}`,
    region: b.region,
    regionKo: REGION_KO[b.region] ?? b.region,
    difficulty: b.difficulty,
    mechanics: b.mechanics,
    mechanicsKo: b.mechanics.map((m) => MECHANIC_KO[m] ?? m),
    weaknesses: b.weaknesses,
    weaknessesKo: b.weaknesses.map((w) => WEAPON_KO[w] ?? w),
    thumbnailUrl: b.thumbnailUrl,
    // "흑요석 핵 Obsidian Core" 등 드랍 아이템 이름 — 역방향 검색 지원
    dropItemNames: b.drops.flatMap((d) => [d.item.nameKo, d.item.nameEn]),
    type: 'boss' as const,
  }))

  const index = meili.index('bosses')
  const task = await index.addDocuments(docs, { primaryKey: 'id' })
  console.log(`  보스 ${docs.length}개 → task ${task.taskUid}`)
}

async function syncItems() {
  const items = await prisma.item.findMany({
    include: {
      bossDrops: { include: { boss: true } },
      dropSources: true,
    },
  })

  const docs = items.map((item) => {
    const bossNames = item.bossDrops.flatMap((d) => [d.boss.nameKo, d.boss.nameEn])
    const sourceNames = item.dropSources.map((s) => s.sourceName)

    return {
      id: item.id,
      slug: item.slug,
      nameKo: item.nameKo,
      nameEn: item.nameEn,
      nameCombined: `${item.nameKo} ${item.nameEn}`,
      category: item.category,
      categoryKo: CATEGORY_KO[item.category] ?? item.category,
      rarity: item.rarity,
      rarityKo: RARITY_KO[item.rarity] ?? item.rarity,
      iconUrl: item.iconUrl,
      dropSourceNames: [...bossNames, ...sourceNames],
      descriptionKo: item.descriptionKo,
      type: 'item' as const,
    }
  })

  const index = meili.index('items')
  const task = await index.addDocuments(docs, { primaryKey: 'id' })
  console.log(`  아이템 ${docs.length}개 → task ${task.taskUid}`)
}

async function main() {
  console.log('🔍 Meilisearch 동기화 시작...\n')

  console.log('⚙️  인덱스 설정 중...')
  await setupIndexes()

  console.log('\n📤 데이터 업로드 중...')
  await syncBosses()
  await syncItems()

  console.log('\n🎉 동기화 완료!')
  console.log('   반영까지 수 초 소요될 수 있습니다.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
