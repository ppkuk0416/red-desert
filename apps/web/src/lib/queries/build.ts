import { prisma } from '@red-desert/db'
import type { BuildCardData } from '@red-desert/ui/build/card'

const VALID_CHARACTERS = ['KLIFF', 'DAMIANE', 'OONGKA'] as const
const VALID_WEAPONS = [
  'SWORD_SHIELD', 'GREATSWORD', 'SPEAR', 'DAGGER', 'BOW',
  'CROSSBOW', 'STAFF', 'SCYTHE', 'HAMMER', 'FLAIL', 'TWIN_SWORDS',
  'BARE_HANDS', 'SPECIAL',
] as const

type ValidCharacter = typeof VALID_CHARACTERS[number]
type ValidWeapon   = typeof VALID_WEAPONS[number]

export type BuildListFilter = {
  character?: string
  weapon?: string
  sort?: 'upvotes' | 'latest'
}

export async function getBuildList(filter: BuildListFilter = {}): Promise<BuildCardData[]> {
  // 허용되지 않은 enum 값은 조용히 무시 (Prisma에 잘못된 값 전달 방지)
  const character = VALID_CHARACTERS.includes(filter.character as ValidCharacter)
    ? (filter.character as ValidCharacter)
    : undefined
  const weapon = VALID_WEAPONS.includes(filter.weapon as ValidWeapon)
    ? (filter.weapon as ValidWeapon)
    : undefined

  const builds = await prisma.build.findMany({
    where: {
      ...(character ? { character } : {}),
      ...(weapon ? { weaponPrimary: weapon } : {}),
    },
    include: {
      _count: { select: { skills: true } },
    },
    orderBy:
      filter.sort === 'latest'
        ? { createdAt: 'desc' }
        : { upvotes: 'desc' },
  })

  return builds.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    character: b.character as BuildCardData['character'],
    weaponPrimary: b.weaponPrimary,
    weaponSecondary: b.weaponSecondary ?? null,
    playstyle: b.playstyle,
    upvotes: b.upvotes,
    skillCount: b._count.skills,
    isVerified: b.isVerified,
    descriptionKo: b.descriptionKo ?? null,
    descriptionEn: b.descriptionEn ?? null,
  }))
}

// Collect distinct weapon types that actually exist in the DB
export async function getBuildWeaponOptions(): Promise<string[]> {
  const rows = await prisma.build.findMany({
    select: { weaponPrimary: true },
    distinct: ['weaponPrimary'],
    orderBy: { weaponPrimary: 'asc' },
  })
  return rows.map((r) => r.weaponPrimary)
}
