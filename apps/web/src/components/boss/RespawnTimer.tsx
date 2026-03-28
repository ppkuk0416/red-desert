'use client'

import { useEffect, useState, useCallback } from 'react'

type Props = {
  bossId: string
  respawnMinutes: number | null
}

function getStorageKey(bossId: string) {
  return `respawn:${bossId}`
}

function getRemainingSeconds(killTime: number, respawnMs: number): number {
  const elapsed = Date.now() - killTime
  return Math.max(0, Math.floor((respawnMs - elapsed) / 1000))
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}시간 ${String(m).padStart(2, '0')}분 ${String(s).padStart(2, '0')}초`
  return `${String(m).padStart(2, '0')}분 ${String(s).padStart(2, '0')}초`
}

export function RespawnTimer({ bossId, respawnMinutes }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [killTime, setKillTime] = useState<number | null>(null)

  const respawnMs = respawnMinutes != null ? respawnMinutes * 60 * 1000 : null

  const load = useCallback(() => {
    if (respawnMs == null) return
    try {
      const raw = localStorage.getItem(getStorageKey(bossId))
      if (!raw) { setKillTime(null); setRemaining(null); return }
      const kt = Number(raw)
      const rem = getRemainingSeconds(kt, respawnMs)
      setKillTime(kt)
      setRemaining(rem > 0 ? rem : 0)
    } catch {
      // localStorage unavailable (SSR guard)
    }
  }, [bossId, respawnMs])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (remaining == null || remaining === 0 || respawnMs == null) return
    const id = setInterval(() => {
      if (killTime == null) return
      const rem = getRemainingSeconds(killTime, respawnMs)
      setRemaining(rem)
      if (rem === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [killTime, remaining, respawnMs])

  function handleKillNow() {
    const now = Date.now()
    try { localStorage.setItem(getStorageKey(bossId), String(now)) } catch { /* ignore */ }
    setKillTime(now)
    setRemaining(respawnMs != null ? Math.floor(respawnMs / 1000) : 0)
  }

  function handleReset() {
    try { localStorage.removeItem(getStorageKey(bossId)) } catch { /* ignore */ }
    setKillTime(null)
    setRemaining(null)
  }

  if (respawnMinutes == null) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900/50 px-5 py-4">
        <p className="text-sm font-medium text-stone-400 mb-1">⏱ 리젠 타이머</p>
        <p className="text-xs text-stone-600">리젠 시간 데이터가 미확인 상태입니다.</p>
      </div>
    )
  }

  const isSpawned = remaining === null || remaining === 0
  const progress = (killTime != null && remaining != null && remaining > 0)
    ? 1 - remaining / (respawnMinutes * 60)
    : isSpawned ? 1 : 0

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/50 px-5 py-4">
      <p className="text-sm font-medium text-stone-400 mb-3">⏱ 리젠 타이머</p>

      {/* 상태 표시 */}
      <div className="mb-3">
        {isSpawned ? (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-green-400 text-sm">보스 출현 중</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="font-semibold text-stone-200 text-sm">리젠까지</span>
            </div>
            <p className="font-mono text-2xl font-bold text-crimson-400">
              {formatTime(remaining!)}
            </p>
          </>
        )}
      </div>

      {/* 진행 바 */}
      {!isSpawned && (
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full rounded-full bg-crimson-600 transition-all duration-1000"
            style={{ width: `${(progress * 100).toFixed(1)}%` }}
          />
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleKillNow}
          className="flex-1 rounded-lg bg-crimson-700 px-3 py-2 text-xs font-semibold text-white hover:bg-crimson-600 transition-colors"
        >
          처치 완료
        </button>
        {!isSpawned && (
          <button
            onClick={handleReset}
            className="rounded-lg border border-stone-700 px-3 py-2 text-xs font-medium text-stone-400 hover:bg-stone-800 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-stone-600">
        리젠 주기: {respawnMinutes}분 · 브라우저 로컬 저장
      </p>
    </div>
  )
}
