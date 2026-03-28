'use client'

import { useState } from 'react'

type DropItem = {
  itemId: string
  nameKo: string
  nameEn: string
}

type Props = {
  bossId: string
  drops: DropItem[]
  locale: string
}

export function ContributeDropRate({ bossId, drops, locale }: Props) {
  const [open, setOpen] = useState(false)
  const [itemId, setItemId] = useState(drops[0]?.itemId ?? '')
  const [dropRatePct, setDropRatePct] = useState(5)
  const [sampleSize, setSampleSize] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!itemId) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contribute/drop-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bossId,
          itemId,
          dropRate: dropRatePct / 100,
          sampleSize: sampleSize ? Number(sampleSize) : undefined,
          note: note || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? '제출 실패')
        setStatus('error')
      } else {
        setStatus('ok')
      }
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.')
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-xl border border-green-800/50 bg-green-950/30 px-5 py-4 text-sm text-green-400">
        ✅ 드랍률 제보가 접수됐습니다. 검토 후 반영됩니다.
        <button
          onClick={() => { setStatus('idle'); setOpen(false) }}
          className="ml-3 underline text-green-500 hover:text-green-300"
        >
          닫기
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-stone-400 hover:text-stone-200 transition-colors"
      >
        <span>📊 드랍률 제보하기</span>
        <span className="text-stone-600">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-stone-800 px-5 pb-5 pt-4 space-y-4">
          {/* 아이템 선택 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              아이템
            </label>
            {drops.length > 0 ? (
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 focus:border-crimson-500 focus:outline-none"
              >
                {drops.map((d) => (
                  <option key={d.itemId} value={d.itemId}>
                    {locale === 'ko' ? d.nameKo : d.nameEn}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-stone-600">등록된 드랍 아이템이 없습니다.</p>
            )}
          </div>

          {/* 드랍률 슬라이더 */}
          <div>
            <label className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-wider text-stone-500">
              <span>드랍률</span>
              <span className="font-mono text-stone-300">{dropRatePct.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={dropRatePct}
              onChange={(e) => setDropRatePct(Number(e.target.value))}
              className="w-full accent-crimson-500"
            />
            <div className="flex justify-between text-xs text-stone-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 표본 수 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              표본 수 <span className="font-normal normal-case text-stone-600">(선택)</span>
            </label>
            <input
              type="number"
              min={1}
              value={sampleSize}
              onChange={(e) => setSampleSize(e.target.value)}
              placeholder="예: 200"
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:border-crimson-500 focus:outline-none"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              메모 <span className="font-normal normal-case text-stone-600">(선택)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="추가 정보를 입력하세요"
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:border-crimson-500 focus:outline-none resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || drops.length === 0}
            className="w-full rounded-lg bg-crimson-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? '제출 중...' : '제보 제출'}
          </button>

          <p className="text-xs text-stone-600 text-center">
            비로그인 상태로도 제보 가능합니다. 로그인 시 기여 이력이 저장됩니다.
          </p>
        </form>
      )}
    </div>
  )
}
