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
  const adminSecret = process.env.ADMIN_SECRET

  // ADMIN_SECRET 미설정 시 서버 오류로 처리 (조용히 열린 상태 방지)
  if (!adminSecret) {
    console.error('[sync-search] ADMIN_SECRET is not configured')
    return NextResponse.json({ error: 'Service misconfigured' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${adminSecret}`) {
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
    // 내부 오류 상세 정보는 로그에만 기록
    console.error('[sync-search] Sync failed:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
