'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthButton() {
  const [user, setUser]   = useState<User | null>(null)
  const [open, setOpen]   = useState(false)
  const [ready, setReady] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router   = useRouter()
  const pathname = usePathname()
  const locale   = useLocale()

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setReady(true)
    })

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const signOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  // 세션 확인 전 — 깜빡임 방지용 빈 공간
  if (!ready) {
    return <div className="h-8 w-8 rounded-full bg-stone-800 animate-pulse" />
  }

  if (!user) {
    return (
      <a
        href={`/${locale}/login?next=${encodeURIComponent(pathname)}`}
        className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs
                   font-medium text-stone-300 transition-colors hover:border-stone-600
                   hover:text-stone-100"
      >
        로그인
      </a>
    )
  }

  const avatarUrl   = user.user_metadata?.avatar_url as string | undefined
  const displayName = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? '유저') as string
  const initials    = displayName.slice(0, 1).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full
                   border border-stone-700 bg-stone-800 transition-colors hover:border-crimson-600"
        aria-label="유저 메뉴"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-stone-300">{initials}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border
                     border-stone-700 bg-stone-900 shadow-2xl shadow-black/50"
        >
          {/* 유저 정보 */}
          <div className="border-b border-stone-800 px-4 py-3">
            <p className="truncate text-sm font-semibold text-stone-100">{displayName}</p>
            <p className="truncate text-xs text-stone-600">{user.email}</p>
          </div>

          {/* 메뉴 항목 */}
          <div className="py-1">
            <a
              href={`/${locale}/profile`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-stone-400 hover:bg-stone-800
                         hover:text-stone-200 transition-colors"
            >
              👤 내 프로필
            </a>
            <a
              href={`/${locale}/build`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-stone-400 hover:bg-stone-800
                         hover:text-stone-200 transition-colors"
            >
              🔧 내 빌드
            </a>
          </div>

          <div className="border-t border-stone-800 py-1">
            <button
              onClick={signOut}
              className="w-full px-4 py-2.5 text-left text-sm text-red-500
                         hover:bg-stone-800 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
