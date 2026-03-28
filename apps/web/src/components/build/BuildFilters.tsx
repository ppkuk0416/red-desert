'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { WEAPON_KO } from '@red-desert/ui/build/card'

const CHARACTERS = [
  { value: '', label: '전체' },
  { value: 'KLIFF', label: '클리프' },
  { value: 'DAMIANE', label: '다미아네' },
  { value: 'OONGKA', label: '웅카' },
] as const

const CHARACTER_ACTIVE: Record<string, string> = {
  '':       'border-stone-600 bg-stone-800 text-stone-200',
  KLIFF:    'border-crimson-700 bg-crimson-900/30 text-crimson-400',
  DAMIANE:  'border-violet-700  bg-violet-900/30  text-violet-400',
  OONGKA:   'border-amber-700   bg-amber-900/30   text-amber-400',
}

type Props = {
  weaponOptions: string[]
  character: string
  weapon: string
  sort: string
}

export function BuildFilters({ weaponOptions, character, weapon, sort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v)
        else params.delete(k)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Character tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 p-1">
        {CHARACTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => push({ character: value })}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                        ${character === value
                          ? (CHARACTER_ACTIVE[value] ?? CHARACTER_ACTIVE[''])
                          : 'border-transparent text-stone-500 hover:text-stone-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Weapon filter */}
      {weaponOptions.length > 0 && (
        <select
          value={weapon}
          onChange={(e) => push({ weapon: e.target.value })}
          className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                     text-stone-300 focus:border-stone-500 focus:outline-none"
        >
          <option value="">주 무기 전체</option>
          {weaponOptions.map((w) => (
            <option key={w} value={w}>
              {WEAPON_KO[w] ?? w}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={sort || 'upvotes'}
        onChange={(e) => push({ sort: e.target.value })}
        className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                   text-stone-300 focus:border-stone-500 focus:outline-none"
      >
        <option value="upvotes">추천순</option>
        <option value="latest">최신순</option>
      </select>
    </div>
  )
}
