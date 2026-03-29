import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@red-desert/db'

// POST /api/builds/like  { buildId }  — 좋아요 토글
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const buildId = typeof body?.buildId === 'string' ? body.buildId : null
  if (!buildId) return NextResponse.json({ error: 'buildId required' }, { status: 400 })

  const build = await prisma.build.findUnique({ where: { id: buildId }, select: { id: true } })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.like.findUnique({
    where: { userId_buildId: { userId: user.id, buildId } },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.build.update({ where: { id: buildId }, data: { upvotes: { decrement: 1 } } }),
    ])
    return NextResponse.json({ liked: false })
  } else {
    await prisma.$transaction([
      prisma.like.create({ data: { userId: user.id, buildId } }),
      prisma.build.update({ where: { id: buildId }, data: { upvotes: { increment: 1 } } }),
    ])
    return NextResponse.json({ liked: true })
  }
}
