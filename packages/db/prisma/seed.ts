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

  // ─────────────────────────────────────────────
  // 지도 마커 데이터
  // ─────────────────────────────────────────────
  const bossMap = Object.fromEntries(
    await Promise.all(
      ['muraka', 'khalk', 'frost-giant-berserk', 'hadum-apostle', 'sea-serpent-boss'].map(
        async (slug) => {
          const b = await prisma.boss.findUnique({ where: { slug } })
          return [slug, b?.id ?? null] as [string, string | null]
        }
      )
    )
  )

  const markerData = [
    // ── 파이웰 성 ─────────────────────────────────
    {
      slug: 'pywel-boss-spawn',
      type: 'BOSS_SPAWN' as const,
      region: 'PYWEL_CASTLE' as const,
      x: 380, y: 320,
      nameKo: '무라카 출몰 지점',
      nameEn: 'Muraka Spawn',
      bossSlug: 'muraka',
      isMissable: false,
      isVerified: true,
      notes: '파이웰 성 중앙 광장. 낮 시간대 출몰.',
    },
    {
      slug: 'pywel-bell-1',
      type: 'BELL' as const,
      region: 'PYWEL_CASTLE' as const,
      x: 190, y: 210,
      nameKo: '성문 입구의 종',
      nameEn: 'Gate Bell',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: null,
    },
    {
      slug: 'pywel-bell-2',
      type: 'BELL' as const,
      region: 'PYWEL_CASTLE' as const,
      x: 560, y: 185,
      nameKo: '망루의 종',
      nameEn: 'Watchtower Bell',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: null,
    },
    {
      slug: 'pywel-artifact-1',
      type: 'ARTIFACT' as const,
      region: 'PYWEL_CASTLE' as const,
      x: 145, y: 440,
      nameKo: '고대 검사상',
      nameEn: 'Ancient Swordsman Statue',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: '성 서편 지하 창고 내부.',
    },

    // ── 손우드 ────────────────────────────────────
    {
      slug: 'thornwood-boss-spawn',
      type: 'BOSS_SPAWN' as const,
      region: 'THORNWOOD' as const,
      x: 980, y: 355,
      nameKo: '하둠의 사도 출몰 지점',
      nameEn: 'Hadum Apostle Spawn',
      bossSlug: 'hadum-apostle',
      isMissable: false,
      isVerified: true,
      notes: '밤에만 출현. 어둠 속성 저항 권장.',
    },
    {
      slug: 'thornwood-bell-1',
      type: 'BELL' as const,
      region: 'THORNWOOD' as const,
      x: 760, y: 205,
      nameKo: '어둠의 숲 종각',
      nameEn: 'Dark Forest Bell',
      bossSlug: null,
      isMissable: false,
      isVerified: false,
      notes: null,
    },
    {
      slug: 'thornwood-tablet-1',
      type: 'TABLET' as const,
      region: 'THORNWOOD' as const,
      x: 1105, y: 445,
      nameKo: '하둠의 예언 석판',
      nameEn: 'Prophecy of Hadum',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: '해독 시 보스 전술 정보 공개.',
    },

    // ── 잿빛 황야 ─────────────────────────────────
    {
      slug: 'ashen-boss-spawn',
      type: 'BOSS_SPAWN' as const,
      region: 'ASHEN_WASTES' as const,
      x: 1560, y: 685,
      nameKo: '칼크 출몰 지점',
      nameEn: 'Khalk Spawn',
      bossSlug: 'khalk',
      isMissable: false,
      isVerified: true,
      notes: '용암 근처 고지대. 화염 저항 장비 필수.',
    },
    {
      slug: 'ashen-artifact-1',
      type: 'ARTIFACT' as const,
      region: 'ASHEN_WASTES' as const,
      x: 1385, y: 460,
      nameKo: '잿빛 독수리상',
      nameEn: 'Ashen Eagle Idol',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: null,
    },
    {
      slug: 'ashen-viewpoint-1',
      type: 'VIEWPOINT' as const,
      region: 'ASHEN_WASTES' as const,
      x: 1840, y: 520,
      nameKo: '황야 절벽 전망대',
      nameEn: 'Wasteland Cliff Viewpoint',
      bossSlug: null,
      isMissable: false,
      isVerified: false,
      notes: '지역 최북단. 이동 수단 필요.',
    },

    // ── 설원 고원 ─────────────────────────────────
    {
      slug: 'frozen-boss-spawn',
      type: 'BOSS_SPAWN' as const,
      region: 'FROZEN_HIGHLANDS' as const,
      x: 1225, y: 1475,
      nameKo: '폭주 서리 거인 출몰 지점',
      nameEn: 'Frenzied Frost Giant Spawn',
      bossSlug: 'frost-giant-berserk',
      isMissable: false,
      isVerified: true,
      notes: '눈보라 동안 공격력 증가.',
    },
    {
      slug: 'frozen-bell-1',
      type: 'BELL' as const,
      region: 'FROZEN_HIGHLANDS' as const,
      x: 895, y: 1210,
      nameKo: '설원 신전의 종',
      nameEn: 'Tundra Temple Bell',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: null,
    },
    {
      slug: 'frozen-bell-2',
      type: 'BELL' as const,
      region: 'FROZEN_HIGHLANDS' as const,
      x: 1415, y: 1285,
      nameKo: '빙하 교회 종',
      nameEn: 'Glacier Church Bell',
      bossSlug: null,
      isMissable: true,
      isVerified: true,
      notes: '특정 퀘스트 완료 후에만 접근 가능.',
    },
    {
      slug: 'frozen-npc-1',
      type: 'NPC' as const,
      region: 'FROZEN_HIGHLANDS' as const,
      x: 1060, y: 1355,
      nameKo: '설원의 현자',
      nameEn: 'Tundra Sage',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: '희귀 아이템 교환 및 스킬 강화 가능.',
    },

    // ── 녹지 해안 ─────────────────────────────────
    {
      slug: 'verdant-boss-spawn',
      type: 'BOSS_SPAWN' as const,
      region: 'VERDANT_COAST' as const,
      x: 385, y: 1685,
      nameKo: '심해 해룡 출몰 지점',
      nameEn: 'Deep Sea Wyrm Spawn',
      bossSlug: 'sea-serpent-boss',
      isMissable: false,
      isVerified: true,
      notes: '해안 절벽 아래 해역. 조류 주의.',
    },
    {
      slug: 'verdant-tablet-1',
      type: 'TABLET' as const,
      region: 'VERDANT_COAST' as const,
      x: 195, y: 1390,
      nameKo: '해룡 전설 석판',
      nameEn: 'Sea Wyrm Legend Tablet',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: null,
    },
    {
      slug: 'verdant-tablet-2',
      type: 'TABLET' as const,
      region: 'VERDANT_COAST' as const,
      x: 655, y: 1605,
      nameKo: '항구 기록 석판',
      nameEn: 'Harbor Records Tablet',
      bossSlug: null,
      isMissable: false,
      isVerified: false,
      notes: null,
    },
    {
      slug: 'verdant-dungeon-1',
      type: 'DUNGEON' as const,
      region: 'VERDANT_COAST' as const,
      x: 510, y: 1870,
      nameKo: '해저 동굴 입구',
      nameEn: 'Undersea Cavern',
      bossSlug: null,
      isMissable: false,
      isVerified: true,
      notes: '수중 이동 스킬 또는 장비 필요.',
    },
  ]

  let markerCount = 0
  for (const data of markerData) {
    const bossId = data.bossSlug ? (bossMap[data.bossSlug] ?? null) : null
    await prisma.mapMarker.upsert({
      where: { id: `seed-${data.slug}` },
      update: {},
      create: {
        id: `seed-${data.slug}`,
        type: data.type,
        region: data.region,
        x: data.x,
        y: data.y,
        nameKo: data.nameKo,
        nameEn: data.nameEn,
        isMissable: data.isMissable,
        isVerified: data.isVerified,
        notes: data.notes,
        ...(bossId ? { bossId } : {}),
      },
    })
    markerCount++
  }
  console.log(`✅ 지도 마커 ${markerCount}개 생성`)

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
