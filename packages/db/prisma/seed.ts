import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 시작...')

  // ─────────────────────────────────────────────
  // 아이템 먼저 (드랍 테이블 참조용)
  // ─────────────────────────────────────────────
  const items = await Promise.all([
    prisma.item.upsert({
      where: { slug: 'obsidian-core' },
      update: {},
      create: {
        slug: 'obsidian-core',
        nameKo: '흑요석 핵',
        nameEn: 'Obsidian Core',
        category: 'MATERIAL',
        rarity: 'RARE',
        descriptionKo: '강력한 보스에게서만 얻을 수 있는 희귀 재료.',
        descriptionEn: 'A rare material obtainable only from powerful bosses.',
      },
    }),
    prisma.item.upsert({
      where: { slug: 'frost-fang' },
      update: {},
      create: {
        slug: 'frost-fang',
        nameKo: '서리 이빨',
        nameEn: 'Frost Fang',
        category: 'MATERIAL',
        rarity: 'UNCOMMON',
        descriptionKo: '얼음 속성 보스의 날카로운 이빨.',
        descriptionEn: 'A sharp fang from a frost-type boss.',
      },
    }),
    prisma.item.upsert({
      where: { slug: 'abyss-artifact-strength' },
      update: {},
      create: {
        slug: 'abyss-artifact-strength',
        nameKo: '심연의 유물: 힘',
        nameEn: 'Abyss Artifact: Strength',
        category: 'ABYSS_ARTIFACT',
        rarity: 'EPIC',
        descriptionKo: '클리프의 공격 스킬을 강화하는 심연의 유물.',
        descriptionEn: "An Abyss Artifact that enhances Kliff's attack skills.",
      },
    }),
    prisma.item.upsert({
      where: { slug: 'crimson-scale' },
      update: {},
      create: {
        slug: 'crimson-scale',
        nameKo: '붉은 비늘',
        nameEn: 'Crimson Scale',
        category: 'MATERIAL',
        rarity: 'RARE',
        descriptionKo: '붉은 용류 계열 보스의 단단한 비늘.',
        descriptionEn: 'A tough scale from a crimson dragon-type boss.',
      },
    }),
    prisma.item.upsert({
      where: { slug: 'giant-heart' },
      update: {},
      create: {
        slug: 'giant-heart',
        nameKo: '거인의 심장',
        nameEn: 'Giant Heart',
        category: 'MATERIAL',
        rarity: 'EPIC',
        descriptionKo: '거대 인간형 보스의 심장. 강한 생명력이 깃들어 있다.',
        descriptionEn: "A heart from a giant humanoid boss, pulsing with immense vitality.",
      },
    }),
  ])

  console.log(`✅ 아이템 ${items.length}개 생성`)

  // ─────────────────────────────────────────────
  // 보스 데이터 (실제 붉은사막 보스 기반)
  // ─────────────────────────────────────────────
  const bossData = [
    {
      slug: 'muraka',
      nameKo: '무라카',
      nameEn: 'Muraka',
      region: 'PYWEL_CASTLE' as const,
      difficulty: 2,
      mechanics: ['PARRY', 'COUNTER'] as const,
      weaknesses: ['SPEAR', 'SWORD_SHIELD'] as const,
      drops: [
        { itemSlug: 'giant-heart', dropRate: 0.3, isGuaranteed: false },
        { itemSlug: 'obsidian-core', dropRate: 0.15, isGuaranteed: false },
      ],
    },
    {
      slug: 'khalk',
      nameKo: '칼크',
      nameEn: 'Khalk',
      region: 'ASHEN_WASTES' as const,
      difficulty: 4,
      mechanics: ['CLIMB', 'ELEMENTAL'] as const,
      weaknesses: ['BOW', 'CROSSBOW', 'STAFF'] as const,
      drops: [
        { itemSlug: 'crimson-scale', dropRate: 0.5, isGuaranteed: false },
        { itemSlug: 'abyss-artifact-strength', dropRate: 0.1, isGuaranteed: false },
      ],
    },
    {
      slug: 'frost-giant-berserk',
      nameKo: '폭주 서리 거인',
      nameEn: 'Frenzied Frost Giant',
      region: 'FROZEN_HIGHLANDS' as const,
      difficulty: 3,
      mechanics: ['SUMMON', 'ELEMENTAL'] as const,
      weaknesses: ['HAMMER', 'GREATSWORD'] as const,
      drops: [
        { itemSlug: 'frost-fang', dropRate: 0.6, isGuaranteed: false },
        { itemSlug: 'obsidian-core', dropRate: 0.2, isGuaranteed: false },
      ],
    },
    {
      slug: 'hadum-apostle',
      nameKo: '하둠의 사도',
      nameEn: 'Hadum Apostle',
      region: 'THORNWOOD' as const,
      difficulty: 5,
      mechanics: ['PARRY', 'ELEMENTAL', 'SUMMON'] as const,
      weaknesses: ['DAGGER', 'TWIN_SWORDS'] as const,
      drops: [
        { itemSlug: 'abyss-artifact-strength', dropRate: 0.25, isGuaranteed: false },
        { itemSlug: 'obsidian-core', dropRate: 0.4, isGuaranteed: false },
      ],
    },
    {
      slug: 'sea-serpent-boss',
      nameKo: '심해 해룡',
      nameEn: 'Deep Sea Wyrm',
      region: 'VERDANT_COAST' as const,
      difficulty: 3,
      mechanics: ['CLIMB', 'MOUNTED'] as const,
      weaknesses: ['SPEAR', 'BOW'] as const,
      drops: [
        { itemSlug: 'crimson-scale', dropRate: 0.35, isGuaranteed: false },
        { itemSlug: 'giant-heart', dropRate: 0.2, isGuaranteed: false },
      ],
    },
  ]

  for (const data of bossData) {
    const boss = await prisma.boss.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        region: data.region,
        difficulty: data.difficulty,
        mechanics: [...data.mechanics],
        weaknesses: [...data.weaknesses],
        isVerified: true,
      },
    })

    // 드랍 연결
    for (const drop of data.drops) {
      const item = await prisma.item.findUnique({ where: { slug: drop.itemSlug } })
      if (!item) continue

      await prisma.bossDrop.upsert({
        where: { bossId_itemId: { bossId: boss.id, itemId: item.id } },
        update: {},
        create: {
          bossId: boss.id,
          itemId: item.id,
          dropRate: drop.dropRate,
          isGuaranteed: drop.isGuaranteed,
        },
      })
    }

    console.log(`  ✅ ${data.nameKo} (${data.nameEn})`)
  }

  console.log('\n🎉 시드 완료!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
