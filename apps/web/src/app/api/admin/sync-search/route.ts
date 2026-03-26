import { NextRequest, NextResponse } from 'next/server'
import { syncAllToSearch } from '@/lib/search/sync'

/**
 * POST /api/admin/sync-search
 * Authorization: Bearer <ADMIN_SECRET>
 *
 * DB 전체를 Meilisearch에 재동기화.
 * 새 데이터 대량 입력 후 또는 인덱스 설정 변경 후 수동 호출.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const start = Date.now()
    await syncAllToSearch()
    const ms = Date.now() - start

    return NextResponse.json({
      ok: true,
      message: '동기화 완료',
      durationMs: ms,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
