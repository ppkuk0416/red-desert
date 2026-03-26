'use client'

import { useEffect, useRef, useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { SearchHit } from '@/lib/search/types'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [cursor, setCursor] = useState(0)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const locale = useLocale()

  // 열릴 때 input focus
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setHits([])
      setCursor(0)
    }
  }, [open])

  // 검색 debounce (200ms)
  useEffect(() => {
    if (!query.trim()) { setHits([]); return }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`)
        if (res.ok) {
          const data = await res.json()
          setHits(data.hits ?? [])
          setCursor(0)
        }
      })
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  const navigate = useCallback((hit: SearchHit) => {
    const path = `/${locale}/${hit.type}/${hit.slug}`
    router.push(path)
    onClose()
  }, [locale, router, onClose])

  // 키보드 네비게이션
  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => Math.min(c + 1, hits.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => Math.max(c - 1, 0))
      }
      if (e.key === 'Enter' && hits[cursor]) {
        navigate(hits[cursor]!)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, hits, cursor, navigate, onClose])

  if (!open) return null

  const bosses = hits.filter((h) => h.type === 'boss')
  const items = hits.filter((h) => h.type === 'item')
  const allHits = [...bosses, ...items]

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* 모달 */}
      <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
        <div className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950 shadow-2xl shadow-black/60">

          {/* 검색 입력 */}
          <div className="flex items-center gap-3 border-b border-stone-800 px-4 py-3">
            <span className="text-stone-500 text-lg">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="보스, 아이템 검색..."
              className="flex-1 bg-transparent text-base text-stone-100 placeholder-stone-600 outline-none"
              autoComplete="off"
            />
            {isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-600 border-t-crimson-500" />
            )}
            <kbd className="rounded border border-stone-700 px-1.5 py-0.5 text-xs text-stone-600">
              ESC
            </kbd>
          </div>

          {/* 결과 */}
          {allHits.length > 0 && (
            <div className="max-h-96 overflow-y-auto py-2">
              {bosses.length > 0 && (
                <ResultGroup
                  title="보스"
                  icon="⚔️"
                  hits={bosses}
                  globalOffset={0}
                  cursor={cursor}
                  onSelect={navigate}
                  locale={locale}
                />
              )}
              {items.length > 0 && (
                <ResultGroup
                  title="아이템"
                  icon="🗡️"
                  hits={items}
                  globalOffset={bosses.length}
                  cursor={cursor}
                  onSelect={navigate}
                  locale={locale}
                />
              )}
            </div>
          )}

          {/* 검색어 있는데 결과 없음 */}
          {query.trim() && !isPending && allHits.length === 0 && (
            <div className="px-4 py-10 text-center text-stone-600">
              <p className="text-2xl mb-2">🔍</p>
              <p>&quot;{query}&quot;에 대한 결과가 없습니다.</p>
            </div>
          )}

          {/* 빈 상태 — 입력 전 */}
          {!query.trim() && (
            <div className="px-4 py-6 text-center text-stone-700 text-sm">
              보스 이름, 아이템 이름, 드랍처 등을 입력하세요
            </div>
          )}

          {/* 하단 단축키 힌트 */}
          <div className="flex items-center gap-4 border-t border-stone-800 px-4 py-2 text-xs text-stone-700">
            <span><kbd className="rounded border border-stone-700 px-1">↑↓</kbd> 이동</span>
            <span><kbd className="rounded border border-stone-700 px-1">Enter</kbd> 선택</span>
            <span><kbd className="rounded border border-stone-700 px-1">ESC</kbd> 닫기</span>
          </div>
        </div>
      </div>
    </>
  )
}

type GroupProps = {
  title: string
  icon: string
  hits: SearchHit[]
  globalOffset: number
  cursor: number
  onSelect: (hit: SearchHit) => void
  locale: string
}

function ResultGroup({ title, icon, hits, globalOffset, cursor, onSelect, locale }: GroupProps) {
  return (
    <div>
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-2 px-4 py-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
          {title}
        </span>
      </div>

      {hits.map((hit, i) => {
        const globalIdx = globalOffset + i
        const isActive = cursor === globalIdx
        const name = locale === 'ko' ? hit.nameKo : hit.nameEn

        return (
          <button
            key={hit.id}
            onClick={() => onSelect(hit)}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isActive
                          ? 'bg-crimson-950/60 text-crimson-300'
                          : 'text-stone-300 hover:bg-stone-800/60'
                        }`}
          >
            {/* 썸네일/아이콘 */}
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-stone-800
                            flex items-center justify-center text-sm">
              {(hit.thumbnailUrl ?? hit.iconUrl) ? (
                <img
                  src={(hit.thumbnailUrl ?? hit.iconUrl)!}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{hit.type === 'boss' ? '⚔️' : '🗡️'}</span>
              )}
            </div>

            {/* 이름 + 메타 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{name}</p>
              <p className="text-xs text-stone-600 truncate">
                {hit.type === 'boss' && hit.regionKo}
                {hit.type === 'item' && hit.categoryKo}
                {hit.type === 'boss' && hit.difficulty && (
                  <span className="ml-2 text-crimson-800">
                    {'★'.repeat(hit.difficulty)}
                  </span>
                )}
                {hit.type === 'item' && hit.rarityKo && (
                  <span className="ml-2">{hit.rarityKo}</span>
                )}
              </p>
            </div>

            {isActive && (
              <kbd className="rounded border border-stone-700 px-1.5 text-xs text-stone-600">
                Enter
              </kbd>
            )}
          </button>
        )
      })}
    </div>
  )
}
