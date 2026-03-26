import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST ?? 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY ?? ''

// 서버 전용 (indexing, admin)
export const meiliAdmin = new MeiliSearch({ host, apiKey })

// 클라이언트 안전 (search only — SEARCH_API_KEY)
const searchKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ?? apiKey
export const meiliSearch = new MeiliSearch({ host, apiKey: searchKey })

export const INDEX = {
  BOSSES: 'bosses',
  ITEMS: 'items',
} as const
