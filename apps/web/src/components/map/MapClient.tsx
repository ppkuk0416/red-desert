'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { MapMarkerData, MapMarkerType } from '@/lib/queries/map'

// ─── Virtual map coordinate space (2000×2000) ───────────────────────────────

type MarkerConfig = {
  emoji: string
  labelKo: string
  color: string
}

const MARKER_CONFIG: Record<MapMarkerType, MarkerConfig> = {
  BELL:       { emoji: '🔔', labelKo: '종',     color: '#f59e0b' },
  ARTIFACT:   { emoji: '🏺', labelKo: '유물',   color: '#a78bfa' },
  TABLET:     { emoji: '📜', labelKo: '석판',   color: '#34d399' },
  BOSS_SPAWN: { emoji: '⚔️', labelKo: '보스',  color: '#f87171' },
  NPC:        { emoji: '🧑', labelKo: 'NPC',    color: '#60a5fa' },
  DUNGEON:    { emoji: '🚪', labelKo: '던전',   color: '#fb923c' },
  VIEWPOINT:  { emoji: '🔭', labelKo: '전망대', color: '#e2e8f0' },
}

const REGION_ZONES = [
  {
    key: 'PYWEL_CASTLE',
    nameKo: '파이웰 성',
    x: 80, y: 80, w: 680, h: 580,
    fill: 'rgba(139, 92, 46, 0.10)',
    stroke: 'rgba(180, 120, 60, 0.35)',
  },
  {
    key: 'THORNWOOD',
    nameKo: '손우드',
    x: 710, y: 100, w: 580, h: 540,
    fill: 'rgba(34, 99, 60, 0.10)',
    stroke: 'rgba(50, 140, 80, 0.35)',
  },
  {
    key: 'ASHEN_WASTES',
    nameKo: '잿빛 황야',
    x: 1240, y: 320, w: 700, h: 780,
    fill: 'rgba(120, 83, 54, 0.10)',
    stroke: 'rgba(160, 110, 70, 0.35)',
  },
  {
    key: 'VERDANT_COAST',
    nameKo: '녹지 해안',
    x: 60, y: 1180, w: 780, h: 740,
    fill: 'rgba(34, 99, 74, 0.10)',
    stroke: 'rgba(50, 140, 100, 0.35)',
  },
  {
    key: 'FROZEN_HIGHLANDS',
    nameKo: '설원 고원',
    x: 790, y: 1080, w: 820, h: 840,
    fill: 'rgba(96, 130, 180, 0.10)',
    stroke: 'rgba(120, 160, 210, 0.35)',
  },
] as const

const STORAGE_KEY = 'rd-map-completed'

function loadCompleted(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveCompleted(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

type Props = {
  markers: MapMarkerData[]
  locale: string
}

export function MapClient({ markers, locale }: Props) {
  const [activeTypes, setActiveTypes] = useState<Set<MapMarkerType>>(
    () => new Set(Object.keys(MARKER_CONFIG) as MapMarkerType[])
  )
  const [selected, setSelected] = useState<MapMarkerData | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [transform, setTransform] = useState({ scale: 0.27, x: 20, y: 20 })

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const didDrag = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Hydrate completed from localStorage
  useEffect(() => {
    setCompleted(loadCompleted())
  }, [])

  // Non-passive wheel listener (required for preventDefault to work)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 0.89
      setTransform((t) => ({
        ...t,
        scale: Math.min(2.5, Math.max(0.15, t.scale * factor)),
      }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const toggleType = useCallback((type: MapMarkerType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleCompleted = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveCompleted(next)
      return next
    })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    isDragging.current = true
    didDrag.current = false
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const visibleMarkers = markers.filter((m) => activeTypes.has(m.type))
  const completedCount = markers.filter((m) => completed.has(m.id)).length

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(MARKER_CONFIG) as MapMarkerType[]).map((type) => {
          const cfg = MARKER_CONFIG[type]
          const count = markers.filter((m) => m.type === type).length
          if (count === 0) return null
          const isActive = activeTypes.has(type)
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm
                          transition-all select-none
                          ${isActive
                            ? 'border-stone-600 bg-stone-800 text-stone-200'
                            : 'border-stone-800 bg-stone-900/50 text-stone-600'}`}
            >
              <span className="text-base leading-none">{cfg.emoji}</span>
              <span>{cfg.labelKo}</span>
              <span className="ml-0.5 rounded-full bg-stone-700/60 px-1.5 text-xs text-stone-500">
                {count}
              </span>
            </button>
          )
        })}
        <span className="ml-auto text-xs text-stone-600">
          수집 <span className="text-stone-400">{completedCount}</span>/{markers.length}
        </span>
      </div>

      {/* ── Map canvas + Info panel ─────────────────────────────────────────── */}
      <div className="flex gap-4">
        {/* Map canvas */}
        <div
          ref={containerRef}
          className="relative h-[520px] flex-1 cursor-grab overflow-hidden rounded-xl
                     border border-stone-800 bg-stone-950 select-none active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            width={2000}
            height={2000}
            style={{
              position: 'absolute',
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              userSelect: 'none',
            }}
          >
            {/* Base */}
            <rect width={2000} height={2000} fill="#0c0b0a" />

            {/* Subtle grid */}
            <defs>
              <pattern id="map-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="rgba(255,255,255,0.025)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width={2000} height={2000} fill="url(#map-grid)" />

            {/* Region zones */}
            {REGION_ZONES.map((r) => (
              <g key={r.key}>
                <rect
                  x={r.x} y={r.y} width={r.w} height={r.h}
                  fill={r.fill}
                  stroke={r.stroke}
                  strokeWidth="1.5"
                  rx="16"
                />
                <text
                  x={r.x + r.w / 2}
                  y={r.y + 32}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.18)"
                  fontSize="20"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="1"
                >
                  {r.nameKo}
                </text>
              </g>
            ))}

            {/* Markers */}
            {visibleMarkers.map((m) => {
              const cfg = MARKER_CONFIG[m.type]
              const isDone = completed.has(m.id)
              const isSelected = selected?.id === m.id
              return (
                <g
                  key={m.id}
                  transform={`translate(${m.x}, ${m.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!didDrag.current) {
                      setSelected((prev) => (prev?.id === m.id ? null : m))
                    }
                  }}
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      r="20"
                      fill="none"
                      stroke={cfg.color}
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  )}
                  {/* Marker circle */}
                  <circle
                    r="13"
                    fill={isDone ? 'rgba(34,197,94,0.25)' : 'rgba(12,11,10,0.85)'}
                    stroke={isDone ? '#22c55e' : cfg.color}
                    strokeWidth="2"
                  />
                  {/* Icon / checkmark */}
                  <text
                    dy="0.4em"
                    textAnchor="middle"
                    fontSize={isDone ? '12' : '11'}
                    style={{ userSelect: 'none' }}
                  >
                    {isDone ? '✓' : cfg.emoji}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Zoom controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1">
            {[
              {
                label: '+',
                onClick: () =>
                  setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale * 1.25) })),
              },
              {
                label: '−',
                onClick: () =>
                  setTransform((t) => ({ ...t, scale: Math.max(0.15, t.scale * 0.8) })),
              },
              {
                label: '↺',
                onClick: () => setTransform({ scale: 0.27, x: 20, y: 20 }),
                title: '초기화',
              },
            ].map(({ label, onClick, title }) => (
              <button
                key={label}
                onClick={onClick}
                title={title}
                className="flex h-7 w-7 items-center justify-center rounded-md border
                           border-stone-700 bg-stone-800 text-sm text-stone-400
                           hover:border-stone-600 hover:text-stone-200 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-stone-800">
            드래그: 이동 · 스크롤: 확대/축소
          </div>

          {/* Empty state */}
          {visibleMarkers.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center
                            justify-center text-stone-700 text-sm">
              필터에 해당하는 마커가 없습니다.
            </div>
          )}
        </div>

        {/* ── Info panel ─────────────────────────────────────────────────────── */}
        {selected && (
          <div className="w-60 shrink-0 rounded-xl border border-stone-800 bg-stone-900 p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-base">{MARKER_CONFIG[selected.type].emoji}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      background: `${MARKER_CONFIG[selected.type].color}22`,
                      color: MARKER_CONFIG[selected.type].color,
                    }}
                  >
                    {MARKER_CONFIG[selected.type].labelKo}
                  </span>
                  {selected.isMissable && (
                    <span className="rounded-full bg-red-900/40 px-1.5 py-0.5 text-xs text-red-400">
                      놓치면 사라짐
                    </span>
                  )}
                  {selected.isVerified && (
                    <span className="rounded-full bg-emerald-900/30 px-1.5 py-0.5 text-xs text-emerald-500">
                      검증됨
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-stone-100 break-words">
                  {locale === 'ko' ? selected.nameKo : selected.nameEn}
                </h3>
                {locale === 'ko' && selected.nameEn && (
                  <p className="mt-0.5 text-xs text-stone-500">{selected.nameEn}</p>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 text-stone-600 hover:text-stone-400 transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {selected.notes && (
              <p className="mb-3 text-xs leading-relaxed text-stone-500">{selected.notes}</p>
            )}

            {selected.bossSlug && (
              <Link
                href={`/${locale}/boss/${selected.bossSlug}`}
                className="mb-3 flex items-center gap-2 rounded-lg border border-stone-700
                           bg-stone-800 px-3 py-2 text-sm text-stone-300 transition-colors
                           hover:border-crimson-700 hover:text-crimson-400"
              >
                <span>⚔️</span>
                <span>보스 공략 보기</span>
              </Link>
            )}

            <button
              onClick={() => toggleCompleted(selected.id)}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-medium
                          transition-colors
                          ${completed.has(selected.id)
                            ? 'border-emerald-700 bg-emerald-950/40 text-emerald-400'
                            : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200'}`}
            >
              {completed.has(selected.id) ? '✓ 수집 완료' : '수집 완료로 표시'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
