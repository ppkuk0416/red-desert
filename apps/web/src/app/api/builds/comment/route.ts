import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@red-desert/db'

// POST /api/builds/comment  { buildId, content }
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const buildId = typeof body?.buildId === 'string' ? body.buildId : null
  const content = typeof body?.content === 'string' ? body.content.trim() : null

  if (!buildId) return NextResponse.json({ error: 'buildId required' }, { status: 400 })
  if (!content || content.length < 1) return NextResponse.json({ error: '내용을 입력하세요.' }, { status: 400 })
  if (content.length > 1000) return NextResponse.json({ error: '댓글은 1000자 이하입니다.' }, { status: 400 })

  const build = await prisma.build.findUnique({ where: { id: buildId }, select: { id: true } })
  if (!build) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 유저 프로필이 없으면 자동 생성
  await prisma.userProfile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      username: `user_${user.id.slice(0, 8)}`,
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    update: {},
  })

  const comment = await prisma.comment.create({
    data: { userId: user.id, buildId, content },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
  })

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
  }, { status: 201 })
}

// DELETE /api/builds/comment?id=xxx
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } })
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // soft delete
  await prisma.comment.update({ where: { id }, data: { isDeleted: true } })
  return NextResponse.json({ ok: true })
}
