import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@red-desert/db'

// GET /api/profile — 현재 로그인 유저 프로필 조회
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.userProfile.findUnique({ where: { id: user.id } })
  return NextResponse.json(profile)
}

// POST /api/profile — 로그인 후 프로필 upsert (OAuth 콜백에서 호출)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const rawUsername: unknown = body.username
  const rawBio: unknown = body.bio
  const rawAvatarUrl: unknown = body.avatarUrl

  // username: 3-20자 영숫자/밑줄만 허용
  const usernameRaw = typeof rawUsername === 'string' ? rawUsername.trim() : null
  if (usernameRaw && !/^[a-zA-Z0-9_]{3,20}$/.test(usernameRaw)) {
    return NextResponse.json(
      { error: 'username은 3-20자 영숫자/밑줄만 사용 가능합니다.' },
      { status: 400 },
    )
  }

  const bio = typeof rawBio === 'string' ? rawBio.slice(0, 200) : undefined
  const avatarUrl = typeof rawAvatarUrl === 'string' ? rawAvatarUrl.slice(0, 500) : undefined

  // 기존 프로필이 없으면 OAuth metadata에서 username 생성
  const fallbackUsername =
    usernameRaw ??
    (user.user_metadata?.full_name as string | undefined)
      ?.replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 20) ??
    `user_${user.id.slice(0, 8)}`

  try {
    const profile = await prisma.userProfile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        username: fallbackUsername,
        avatarUrl: avatarUrl ?? (user.user_metadata?.avatar_url as string | undefined),
        bio,
      },
      update: {
        ...(usernameRaw && { username: usernameRaw }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    })
    return NextResponse.json(profile)
  } catch (err: unknown) {
    const isUniqueViolation =
      typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002'
    if (isUniqueViolation) {
      return NextResponse.json({ error: '이미 사용 중인 username입니다.' }, { status: 409 })
    }
    console.error('[profile upsert]', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
