'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { LocaleSwitcher } from '../components/LocaleSwitcher'

const NAV_ITEMS = ['boss', 'item', 'map', 'build'] as const

export function Header() {
  const t = useTranslations('Nav')
  const locale = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-stone-950/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 font-bold text-lg text-gradient-crimson"
        >
          <span className="text-xl">🏜️</span>
          <span>붉은사막 DB</span>
        </Link>

        {/* 데스크탑 네비 */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item}>
              <Link
                href={`/${locale}/${item}`}
                className="px-4 py-2 rounded-lg text-stone-400 hover:text-stone-100
                           hover:bg-stone-800 transition-colors text-sm font-medium"
              >
                {t(item)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-400 hover:bg-stone-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href={`/${locale}/${item}`}
              className="block py-3 text-stone-400 hover:text-stone-100 border-b border-stone-800 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {t(item)}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
