import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST ?? 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY ?? ''

// 서버 전용 (indexing, admin)
export const meiliAdmin = new MeiliSearch({ host, apiKey })

// 클라이언트 안전 (search only — NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY 필수)
// NEXT_PUBLIC_ 없이 빌드되면 master key가 노출될 수 있으므로 절대 admin key로 폴백하지 않음
const searchKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ?? ''
export const meiliSearch = new MeiliSearch({ host, apiKey: searchKey })

export const INDEX = {
  BOSSES: 'bosses',
  ITEMS: 'items',
} as const
