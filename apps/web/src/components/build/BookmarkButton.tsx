'use client'

import { useState } from 'react'

type Props = { buildId: string }

export function BookmarkButton({ buildId }: Props) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/builds/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId }),
      })
      if (res.status === 401) {
        alert('로그인이 필요합니다.')
        return
      }
      const json = await res.json()
      if (res.ok) setBookmarked(json.bookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={bookmarked ? '북마크 해제' : '북마크'}
      className={`flex items-center justify-center rounded-lg border p-1.5 transition-colors disabled:opacity-50 ${
        bookmarked
          ? 'border-amber-600 bg-amber-950/50 text-amber-400'
          : 'border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
      }`}
    >
      {bookmarked ? '🔖' : '📄'}
    </button>
  )
}
