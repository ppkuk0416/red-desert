import { prisma } from '@red-desert/db'

export type MapMarkerType =
  | 'BELL'
  | 'ARTIFACT'
  | 'TABLET'
  | 'BOSS_SPAWN'
  | 'NPC'
  | 'DUNGEON'
  | 'VIEWPOINT'

export type MapRegionKey =
  | 'PYWEL_CASTLE'
  | 'THORNWOOD'
  | 'ASHEN_WASTES'
  | 'FROZEN_HIGHLANDS'
  | 'VERDANT_COAST'

export type MapMarkerData = {
  id: string
  type: MapMarkerType
  region: MapRegionKey
  x: number
  y: number
  nameKo: string
  nameEn: string
  isMissable: boolean
  bossSlug: string | null
  notes: string | null
  isVerified: boolean
}

export async function getMapMarkers(filter: {
  types?: MapMarkerType[]
  region?: MapRegionKey
} = {}): Promise<MapMarkerData[]> {
  const markers = await prisma.mapMarker.findMany({
    where: {
      ...(filter.types?.length ? { type: { in: filter.types } } : {}),
      ...(filter.region ? { region: filter.region } : {}),
    },
    include: {
      boss: { select: { slug: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return markers.map((m) => ({
    id: m.id,
    type: m.type as MapMarkerType,
    region: m.region as MapRegionKey,
    x: m.x,
    y: m.y,
    nameKo: m.nameKo,
    nameEn: m.nameEn,
    isMissable: m.isMissable,
    bossSlug: m.boss?.slug ?? null,
    notes: m.notes,
    isVerified: m.isVerified,
  }))
}
