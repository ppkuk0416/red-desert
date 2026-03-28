import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 * Supabase OAuth PKCE 코드 교환 — Google / Discord 로그인 후 리디렉션 엔드포인트
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  if (error) {
    console.error('[auth/callback] OAuth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/ko/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // 로그인 성공 → next 파라미터(있으면) 또는 홈으로
      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/ko`
      return NextResponse.redirect(redirectUrl)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
  }

  return NextResponse.redirect(`${origin}/ko/login?error=auth_failed`)
}
