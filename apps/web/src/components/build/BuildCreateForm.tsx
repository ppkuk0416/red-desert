'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHARACTERS = [
  { value: 'KLIFF', label: '클리프' },
  { value: 'DAMIANE', label: '다미아네' },
  { value: 'OONGKA', label: '웅카' },
]

const WEAPONS = [
  { value: 'SWORD_SHIELD', label: '검+방패' },
  { value: 'GREATSWORD', label: '대검' },
  { value: 'SPEAR', label: '창' },
  { value: 'DAGGER', label: '단검' },
  { value: 'BOW', label: '활' },
  { value: 'CROSSBOW', label: '석궁' },
  { value: 'STAFF', label: '지팡이' },
  { value: 'SCYTHE', label: '낫' },
  { value: 'HAMMER', label: '망치' },
  { value: 'FLAIL', label: '도리깨' },
  { value: 'TWIN_SWORDS', label: '쌍검' },
  { value: 'BARE_HANDS', label: '맨손' },
  { value: 'SPECIAL', label: '특수' },
]

const PLAYSTYLES = [
  { value: 'MAIN_STORY', label: '메인 스토리' },
  { value: 'BOSS_HUNTER', label: '보스 헌터' },
  { value: 'COMPLETIONIST', label: '완벽주의' },
  { value: 'EXPLORER', label: '탐험가' },
]

type Props = { locale: string }

export function BuildCreateForm({ locale }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState('KLIFF')
  const [weaponPrimary, setWeaponPrimary] = useState('SWORD_SHIELD')
  const [weaponSecondary, setWeaponSecondary] = useState('')
  const [playstyle, setPlaystyle] = useState('BOSS_HUNTER')
  const [descriptionKo, setDescriptionKo] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/builds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        character,
        weaponPrimary,
        weaponSecondary: weaponSecondary || null,
        playstyle,
        descriptionKo: descriptionKo || null,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setErrorMsg(json.error ?? '제출 실패')
      setStatus('error')
      return
    }

    router.push(`/${locale}/build/${json.slug}`)
  }

  const inputCls =
    'w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:border-crimson-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 제목 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          빌드 이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 클리프 대검 보스 특화 빌드"
          maxLength={100}
          required
          className={inputCls}
        />
        <p className="mt-1 text-right text-xs text-stone-600">{title.length}/100</p>
      </div>

      {/* 캐릭터 + 무기 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            캐릭터 <span className="text-red-500">*</span>
          </label>
          <select value={character} onChange={(e) => setCharacter(e.target.value)} className={inputCls}>
            {CHARACTERS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            주무기 <span className="text-red-500">*</span>
          </label>
          <select value={weaponPrimary} onChange={(e) => setWeaponPrimary(e.target.value)} className={inputCls}>
            {WEAPONS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
            보조무기 <span className="font-normal normal-case text-stone-600">(선택)</span>
          </label>
          <select value={weaponSecondary} onChange={(e) => setWeaponSecondary(e.target.value)} className={inputCls}>
            <option value="">없음</option>
            {WEAPONS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 플레이스타일 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          플레이스타일 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PLAYSTYLES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlaystyle(p.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                playstyle === p.value
                  ? 'bg-crimson-700 text-white'
                  : 'border border-stone-700 bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
          빌드 설명 <span className="font-normal normal-case text-stone-600">(선택)</span>
        </label>
        <textarea
          value={descriptionKo}
          onChange={(e) => setDescriptionKo(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="스킬 우선순위, 장비 추천, 전투 팁 등을 자유롭게 작성하세요"
          className={`${inputCls} resize-none`}
        />
        <p className="mt-1 text-right text-xs text-stone-600">{descriptionKo.length}/2000</p>
      </div>

      {errorMsg && (
        <p className="rounded-lg bg-red-950/40 px-4 py-2.5 text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || title.trim().length < 2}
        className="w-full rounded-lg bg-crimson-700 px-4 py-3 text-sm font-semibold text-white hover:bg-crimson-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? '저장 중...' : '빌드 저장하기'}
      </button>
    </form>
  )
}
