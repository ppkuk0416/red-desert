'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Components에서 사용
 * 싱글턴 패턴 — 매 렌더마다 새 인스턴스 생성하지 않음
 */
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}
