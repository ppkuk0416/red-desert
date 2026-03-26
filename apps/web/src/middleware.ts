import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware(routing)

/**
 * 처리 순서:
 * 1. 정적 파일 / API / _next → 바이패스
 * 2. i18n 미들웨어 → locale redirect/rewrite
 * 3. Supabase 세션 갱신 → 쿠키 refresh
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 정적 자산, API 라우트는 바이패스
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.[a-z]+$/.test(pathname)

  if (isStatic) return NextResponse.next()

  // 1단계: i18n 처리
  const intlResponse = intlMiddleware(request)

  // 2단계: Supabase 세션 갱신 (i18n response 위에 쿠키 적용)
  return updateSession(request, intlResponse)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
