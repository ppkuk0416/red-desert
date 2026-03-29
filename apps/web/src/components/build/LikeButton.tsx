'use client'

import { useState } from 'react'

type Props = {
  buildId: string
  initialCount: number
}

export function LikeButton({ buildId, initialCount }: Props) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/builds/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildId }),
      })
      if (res.status === 401) {
        alert('로그인이 필요합니다.')
        return
      }
      const json = await res.json()
      if (res.ok) {
        setLiked(json.liked)
        setCount((c) => c + (json.liked ? 1 : -1))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        liked
          ? 'border-crimson-600 bg-crimson-950/50 text-crimson-400'
          : 'border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
      }`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
