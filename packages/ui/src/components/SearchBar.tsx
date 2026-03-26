'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type Props = {
  placeholder?: string
  paramKey?: string
}

export function SearchBar({ placeholder = '검색...', paramKey = 'q' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set(paramKey, e.target.value)
    } else {
      params.delete(paramKey)
    }
    // 검색 시 페이지 리셋
    params.delete('page')

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
        🔍
      </span>
      <input
        type="text"
        defaultValue={searchParams.get(paramKey) ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-stone-700 bg-stone-900 py-2.5 pl-9 pr-4
                    text-stone-100 placeholder-stone-600 outline-none transition-colors
                    focus:border-crimson-600 focus:ring-1 focus:ring-crimson-600
                    ${isPending ? 'opacity-70' : ''}`}
      />
    </div>
  )
}
