import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const securityHeaders = [
  // 클릭재킹 방지
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME 스니핑 방지
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer 노출 최소화
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // XSS 필터 (구형 브라우저용)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // 권한 정책 — 불필요한 브라우저 기능 차단
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS — HTTPS 강제 (프로덕션 배포 시 활성화됨, 로컬 http는 브라우저가 무시)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 모든 라우트에 보안 헤더 적용
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // 프로젝트 전용 서브도메인으로 한정 (빌드 시 환경변수로 주입 권장)
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
}

export default withNextIntl(nextConfig)
