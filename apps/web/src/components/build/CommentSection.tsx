'use client'

import { useState } from 'react'

type CommentUser = {
  id: string
  username: string
  avatarUrl: string | null
}

type CommentItem = {
  id: string
  content: string
  createdAt: string
  user: CommentUser | null
}

type Props = {
  buildId: string
  initialComments: CommentItem[]
}

function Avatar({ user }: { user: CommentUser | null }) {
  if (!user) return <div className="h-7 w-7 shrink-0 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-500">?</div>
  return (
    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-stone-700 flex items-center justify-center text-xs">
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
        : user.username[0].toUpperCase()}
    </div>
  )
}

export function CommentSection({ buildId, initialComments }: Props) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/builds/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildId, content: text.trim() }),
    })
    const json = await res.json()

    if (res.status === 401) {
      setError('댓글을 작성하려면 로그인이 필요합니다.')
      setSubmitting(false)
      return
    }
    if (!res.ok) {
      setError(json.error ?? '오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    setComments((prev) => [json, ...prev])
    setText('')
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    setDeletingId(id)
    const res = await fetch(`/api/builds/comment?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="댓글을 입력하세요 (로그인 필요)"
          className="flex-1 resize-none rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-200 placeholder:text-stone-600 focus:border-crimson-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="self-end shrink-0 rounded-xl bg-crimson-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : '등록'}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-stone-600">첫 번째 댓글을 남겨보세요.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3">
              <Avatar user={c.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-300">
                    {c.user?.username ?? '익명'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600">
                      {new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(c.createdAt))}
                    </span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="text-xs text-stone-700 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="text-sm text-stone-300 whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
