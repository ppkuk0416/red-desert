// Meilisearch에 저장되는 문서 타입

export type BossDocument = {
  id: string          // Meilisearch primary key
  slug: string
  nameKo: string
  nameEn: string
  nameCombined: string  // "무라카 Muraka" — 한/영 동시 검색용
  region: string
  regionKo: string
  difficulty: number
  mechanics: string[]
  mechanicsKo: string[]
  weaknesses: string[]
  weaknessesKo: string[]
  thumbnailUrl: string | null
  dropItemNames: string[]  // "흑요석 핵 Obsidian Core" 등
  type: 'boss'
}

export type ItemDocument = {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  nameCombined: string
  category: string
  categoryKo: string
  rarity: string
  rarityKo: string
  iconUrl: string | null
  dropSourceNames: string[]  // 드랍처 이름들 (보스명 포함)
  descriptionKo: string | null
  type: 'item'
}

export type SearchDocument = BossDocument | ItemDocument

export type SearchHit = {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  type: 'boss' | 'item'
  thumbnailUrl?: string | null
  iconUrl?: string | null
  region?: string
  regionKo?: string
  difficulty?: number
  category?: string
  categoryKo?: string
  rarity?: string
  rarityKo?: string
  _formatted?: Record<string, string>
}
