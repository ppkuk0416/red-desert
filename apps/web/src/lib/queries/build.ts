import { prisma } from '@red-desert/db'
import type { BuildCardData } from '@red-desert/ui/build/card'

export type BuildListFilter = {
  character?: string
  weapon?: string
  sort?: 'upvotes' | 'latest'
}

export async function getBuildList(filter: BuildListFilter = {}): Promise<BuildCardData[]> {
  const builds = await prisma.build.findMany({
    where: {
      ...(filter.character ? { character: filter.character as never } : {}),
      ...(filter.weapon ? { weaponPrimary: filter.weapon as never } : {}),
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
