'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (next: 'ko' | 'en') => {
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-stone-700 p-0.5 text-xs">
      {(['ko', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            locale === l
              ? 'bg-crimson-700 text-white'
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          {l === 'ko' ? '한국어' : 'EN'}
        </button>
      ))}
    </div>
  )
}
