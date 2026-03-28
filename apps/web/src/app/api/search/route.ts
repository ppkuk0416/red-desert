import { NextRequest, NextResponse } from 'next/server'
import { meiliSearch, INDEX } from '@/lib/search/client'
import type { SearchHit } from '@/lib/search/types'

/**
 * GET /api/search?q=무라카&type=all&limit=10
 *
 * type: 'boss' | 'item' | 'all' (기본값 all)
 * limit: 결과 수 (기본값 10, 최대 20)
 *
 * 멀티 인덱스 검색으로 보스/아이템 동시 검색 후
 * relevance 기준 병합 반환
 */
const VALID_SEARCH_TYPES = ['boss', 'item', 'all'] as const
type SearchType = typeof VALID_SEARCH_TYPES[number]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()

  const rawType = searchParams.get('type') ?? 'all'
  const type: SearchType = VALID_SEARCH_TYPES.includes(rawType as SearchType)
    ? (rawType as SearchType)
    : 'all'

  const rawLimit = Number(searchParams.get('limit') ?? 10)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 10

  if (!q || q.length < 1) {
    return NextResponse.json({ hits: [], query: '', processingTimeMs: 0 })
  }

  // 과도하게 긴 쿼리 차단 (Meilisearch 부하 방지)
  if (q.length > 100) {
    return NextResponse.json({ hits: [], query: q.slice(0, 100), processingTimeMs: 0 })
  }

  try {
    const searchOptions = {
      limit,
      attributesToHighlight: ['nameKo', 'nameEn'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      attributesToCrop: ['descriptionKo'],
      cropLength: 30,
    }

    if (type === 'boss') {
      const result = await meiliSearch
        .index(INDEX.BOSSES)
        .search<SearchHit>(q, searchOptions)

      return NextResponse.json({
        hits: result.hits,
        query: q,
        processingTimeMs: result.processingTimeMs,
      })
    }

    if (type === 'item') {
      const result = await meiliSearch
        .index(INDEX.ITEMS)
        .search<SearchHit>(q, searchOptions)

      return NextResponse.json({
        hits: result.hits,
        query: q,
        processingTimeMs: result.processingTimeMs,
      })
    }

    // type === 'all': 멀티 인덱스 동시 검색
    const [bossResult, itemResult] = await Promise.all([
      meiliSearch.index(INDEX.BOSSES).search<SearchHit>(q, {
        ...searchOptions,
        limit: Math.ceil(limit / 2),
      }),
      meiliSearch.index(INDEX.ITEMS).search<SearchHit>(q, {
        ...searchOptions,
        limit: Math.ceil(limit / 2),
      }),
    ])

    // 보스/아이템 결과를 점수 순 병합
    const merged: SearchHit[] = [
      ...bossResult.hits,
      ...itemResult.hits,
    ].slice(0, limit)

    return NextResponse.json({
      hits: merged,
      query: q,
      processingTimeMs: Math.max(
        bossResult.processingTimeMs,
        itemResult.processingTimeMs,
      ),
      counts: {
        bosses: bossResult.hits.length,
        items: itemResult.hits.length,
      },
    })
  } catch (error) {
    // Meilisearch 미연결 시 graceful degradation
    console.error('[search] Meilisearch error:', error)
    return NextResponse.json(
      { hits: [], query: q, error: 'Search unavailable' },
      { status: 503 },
    )
  }
}
