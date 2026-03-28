import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://red-desert.gg'

/**
 * GET /api/og
 * ?title=보스+공략&subtitle=무라카&type=boss|item|map|build|default
 *
 * 동적 OG 이미지 생성 (1200×630)
 * Discord, KakaoTalk, Twitter 임베드에 표시됨
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title    = searchParams.get('title')    ?? '붉은사막 DB'
  const subtitle = searchParams.get('subtitle') ?? '보스 공략 · 아이템 DB · 지도 · 빌드'
  const type     = searchParams.get('type')     ?? 'default'

  const typeIcon: Record<string, string> = {
    boss:    '⚔️',
    item:    '🗡️',
    map:     '🗺️',
    build:   '🔧',
    default: '🏔️',
  }

  const typeColor: Record<string, string> = {
    boss:    '#b91c1c',
    item:    '#92400e',
    map:     '#065f46',
    build:   '#1e3a8a',
    default: '#7c2d12',
  }

  const accent = typeColor[type] ?? typeColor.default
  const icon   = typeIcon[type]  ?? typeIcon.default

  // 제목/부제목 길이 제한
  const safeTitle    = title.slice(0, 60)
  const safeSubtitle = subtitle.slice(0, 80)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0c0b0a 0%, #1c1917 50%, #0f0e0d 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 장식 — 붉은 그라디언트 원 */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />

        {/* 사이트 로고 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: accent,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            🔴
          </div>
          <span
            style={{
              color: '#a8a29e',
              fontSize: '20px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            붉은사막 DB
          </span>
        </div>

        {/* 타입 뱃지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: `${accent}22`,
            border: `1px solid ${accent}66`,
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span style={{ color: '#d4c5b5', fontSize: '16px', fontWeight: '500' }}>
            {type === 'boss' ? '보스 공략' :
             type === 'item' ? '아이템 DB' :
             type === 'map'  ? '인터랙티브 지도' :
             type === 'build'? '빌드 플래너' : '붉은사막 커뮤니티'}
          </span>
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            color: '#fafaf9',
            fontSize: safeTitle.length > 20 ? '52px' : '68px',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '20px',
            letterSpacing: '-1px',
          }}
        >
          {safeTitle}
        </div>

        {/* 부제목 */}
        <div
          style={{
            color: '#78716c',
            fontSize: '26px',
            lineHeight: '1.4',
            maxWidth: '900px',
          }}
        >
          {safeSubtitle}
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '100px',
            color: '#44403c',
            fontSize: '18px',
            letterSpacing: '1px',
          }}
        >
          {BASE.replace('https://', '')}
        </div>

        {/* 하단 장식 라인 */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
