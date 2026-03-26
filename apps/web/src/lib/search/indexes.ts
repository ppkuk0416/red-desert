import { meiliAdmin, INDEX } from './client'

/**
 * Meilisearch 인덱스 초기 설정
 * 처음 한 번만 실행 (setup.sh 또는 npm run search:setup)
 *
 * 한국어 검색 핵심 설정:
 * - separatorTokens: 한국어는 공백 외 구분자 없음 → 부분 매칭 허용
 * - typoTolerance: 오타 허용 (1-2자 오차)
 * - rankingRules: typo 먼저 → 관련성 순
 */
export async function setupIndexes() {
  // ── 보스 인덱스 ─────────────────────────────────
  const bossIndex = meiliAdmin.index(INDEX.BOSSES)

  await bossIndex.updateSettings({
    searchableAttributes: [
      'nameCombined',   // 최고 우선순위: "무라카 Muraka"
      'nameKo',
      'nameEn',
      'regionKo',
      'mechanicsKo',
      'weaknessesKo',
      'dropItemNames',  // "흑요석 핵 드랍처" 같은 역방향 검색
    ],
    filterableAttributes: [
      'region',
      'difficulty',
      'mechanics',
      'weaknesses',
      'type',
    ],
    sortableAttributes: [
      'difficulty',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    },
    // 한국어 부분 문자열 매칭
    separatorTokens: [],
    nonSeparatorTokens: [],
    // 검색 결과 하이라이트용
    displayedAttributes: [
      'id', 'slug', 'nameKo', 'nameEn', 'nameCombined',
      'region', 'regionKo', 'difficulty', 'thumbnailUrl',
      'mechanics', 'mechanicsKo', 'weaknesses', 'weaknessesKo',
      'type',
    ],
  })

  console.log('✅ bosses 인덱스 설정 완료')

  // ── 아이템 인덱스 ─────────────────────────────────
  const itemIndex = meiliAdmin.index(INDEX.ITEMS)

  await itemIndex.updateSettings({
    searchableAttributes: [
      'nameCombined',    // 최고 우선순위
      'nameKo',
      'nameEn',
      'categoryKo',
      'rarityKo',
      'dropSourceNames', // "무라카에서 드랍" 검색 가능
      'descriptionKo',   // 설명 텍스트 검색
    ],
    filterableAttributes: [
      'category',
      'rarity',
      'type',
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 3,
        twoTypos: 7,
      },
    },
    displayedAttributes: [
      'id', 'slug', 'nameKo', 'nameEn', 'nameCombined',
      'category', 'categoryKo', 'rarity', 'rarityKo',
      'iconUrl', 'type',
    ],
  })

  console.log('✅ items 인덱스 설정 완료')
}
