import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@red-desert/db'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/contribute/drop-rate
 * 드랍률 제보 — 로그인 선택 사항 (비로그인도 허용)
 *
 * Body: { bossId, itemId, dropRate, sampleSize?, note? }
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { bossId, itemId, dropRate, sampleSize, note } = body as Record<string, unknown>

  if (!bossId || !itemId) {
    return NextResponse.json({ error: 'bossId와 itemId는 필수입니다.' }, { status: 400 })
  }

  const parsedRate = Number(dropRate)
  if (!Number.isFinite(parsedRate) || parsedRate < 0 || parsedRate > 1) {
    return NextResponse.json({ error: 'dropRate는 0~1 사이 숫자여야 합니다.' }, { status: 400 })
  }

  // 선택: 로그인 사용자 UID 연결
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch { /* 미로그인 허용 */ }

  try {
    const contribution = await prisma.contribution.create({
      data: {
        type: 'DROP_RATE',
        targetId: bossId as string,
        userId,
        data: {
          bossId,
          itemId,
          dropRate: parsedRate,
          sampleSize: sampleSize ? Number(sampleSize) : null,
        },
        note: (note as string | null) ?? null,
      },
    })

    return NextResponse.json({ ok: true, id: contribution.id })
  } catch (error) {
    console.error('[contribute/drop-rate]', error)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
