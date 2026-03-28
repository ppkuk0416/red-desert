'use client'

import { useState } from 'react'

type Props = { adminSecret: string }

type Tab = 'boss' | 'item' | 'sync'

const REGIONS = ['PYWEL_CASTLE', 'THORNWOOD', 'ASHEN_WASTES', 'FROZEN_HIGHLANDS', 'VERDANT_COAST']
const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성', THORNWOOD: '손우드', ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원', VERDANT_COAST: '녹지 해안',
}
const MECHANICS  = ['PARRY', 'COUNTER', 'CLIMB', 'SUMMON', 'ELEMENTAL', 'MOUNTED']
const WEAPONS    = ['SWORD_SHIELD', 'GREATSWORD', 'SPEAR', 'DAGGER', 'BOW', 'CROSSBOW', 'STAFF', 'SCYTHE', 'HAMMER', 'FLAIL', 'TWIN_SWORDS', 'BARE_HANDS', 'SPECIAL']
const WEAPON_KO: Record<string, string> = {
  SWORD_SHIELD: '검+방패', GREATSWORD: '대검', SPEAR: '창', DAGGER: '단검', BOW: '활',
  CROSSBOW: '석궁', STAFF: '지팡이', SCYTHE: '낫', HAMMER: '망치', FLAIL: '도리깨',
  TWIN_SWORDS: '쌍검', BARE_HANDS: '맨손', SPECIAL: '특수',
}
const CATEGORIES = ['WEAPON', 'ARMOR', 'MATERIAL', 'CONSUMABLE', 'ABYSS_ARTIFACT', 'COLLECTIBLE', 'QUEST', 'TRADE_GOOD']
const CAT_KO: Record<string, string> = {
  WEAPON: '무기', ARMOR: '방어구', MATERIAL: '재료', CONSUMABLE: '소비',
  ABYSS_ARTIFACT: '심연 유물', COLLECTIBLE: '수집품', QUEST: '퀘스트', TRADE_GOOD: '교역품',
}
const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
const RARITY_KO: Record<string, string> = {
  COMMON: '일반', UNCOMMON: '고급', RARE: '희귀', EPIC: '영웅', LEGENDARY: '전설',
}

function useAdminFetch(adminSecret: string) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminSecret}` }

  async function post<T>(url: string, body: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
    try {
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
      const data = await res.json()
      return res.ok ? { ok: true, data } : { ok: false, error: data.error ?? '오류 발생' }
    } catch {
      return { ok: false, error: '네트워크 오류' }
    }
  }

  return { post }
}

// ── Boss Form ──────────────────────────────────────────────────────────────

function BossForm({ adminSecret }: { adminSecret: string }) {
  const { post } = useAdminFetch(adminSecret)
  const [form, setForm] = useState({
    slug: '', nameKo: '', nameEn: '', region: 'PYWEL_CASTLE',
    difficulty: 1, thumbnailUrl: '', videoUrl: '',
    mechanics: [] as string[], weaknesses: [] as string[],
  })
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleArr = (key: 'mechanics' | 'weaknesses', val: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }))
  }

  const submit = async () => {
    setLoading(true)
    setStatus(null)
    const res = await post('/api/admin/boss', form)
    setStatus(res.ok ? { ok: true, msg: `✅ ${form.nameKo} 저장됨` } : { ok: false, msg: `❌ ${res.error}` })
    if (res.ok) setForm({ slug: '', nameKo: '', nameEn: '', region: 'PYWEL_CASTLE', difficulty: 1, thumbnailUrl: '', videoUrl: '', mechanics: [], weaknesses: [] })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-stone-100">보스 추가 / 수정</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(['slug', 'nameKo', 'nameEn'] as const).map((field) => (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">{field}</span>
            <input
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                         text-stone-200 focus:border-stone-500 focus:outline-none"
              placeholder={field === 'slug' ? 'muraka' : field === 'nameKo' ? '무라카' : 'Muraka'}
            />
          </label>
        ))}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">region</span>
          <select
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
          >
            {REGIONS.map((r) => <option key={r} value={r}>{REGION_KO[r]}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">난이도 (1~5)</span>
          <input
            type="number" min={1} max={5}
            value={form.difficulty}
            onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">thumbnailUrl (선택)</span>
          <input
            value={form.thumbnailUrl}
            onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
            placeholder="https://..."
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">videoUrl (선택)</span>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
            placeholder="https://youtube.com/..."
          />
        </label>
      </div>

      {/* 메커닉 */}
      <div>
        <p className="mb-2 text-xs text-stone-500">전투 메커닉</p>
        <div className="flex flex-wrap gap-2">
          {MECHANICS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleArr('mechanics', m)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors
                          ${form.mechanics.includes(m)
                            ? 'border-crimson-700 bg-crimson-900/40 text-crimson-400'
                            : 'border-stone-700 text-stone-500 hover:text-stone-300'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 약점 */}
      <div>
        <p className="mb-2 text-xs text-stone-500">약점 무기</p>
        <div className="flex flex-wrap gap-2">
          {WEAPONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => toggleArr('weaknesses', w)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors
                          ${form.weaknesses.includes(w)
                            ? 'border-amber-700 bg-amber-900/40 text-amber-400'
                            : 'border-stone-700 text-stone-500 hover:text-stone-300'}`}
            >
              {WEAPON_KO[w]}
            </button>
          ))}
        </div>
      </div>

      {status && (
        <p className={`text-sm ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <button
        onClick={submit}
        disabled={loading || !form.slug || !form.nameKo || !form.nameEn}
        className="rounded-lg bg-crimson-700 px-5 py-2.5 text-sm font-semibold text-white
                   transition-colors hover:bg-crimson-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '저장 중...' : '보스 저장'}
      </button>
    </div>
  )
}

// ── Item Form ──────────────────────────────────────────────────────────────

function ItemForm({ adminSecret }: { adminSecret: string }) {
  const { post } = useAdminFetch(adminSecret)
  const [form, setForm] = useState({
    slug: '', nameKo: '', nameEn: '',
    category: 'MATERIAL', rarity: 'COMMON',
    descriptionKo: '', descriptionEn: '', iconUrl: '',
  })
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setStatus(null)
    const res = await post('/api/admin/item', form)
    setStatus(res.ok ? { ok: true, msg: `✅ ${form.nameKo} 저장됨` } : { ok: false, msg: `❌ ${res.error}` })
    if (res.ok) setForm({ slug: '', nameKo: '', nameEn: '', category: 'MATERIAL', rarity: 'COMMON', descriptionKo: '', descriptionEn: '', iconUrl: '' })
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-stone-100">아이템 추가 / 수정</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(['slug', 'nameKo', 'nameEn'] as const).map((field) => (
          <label key={field} className="flex flex-col gap-1">
            <span className="text-xs text-stone-500">{field}</span>
            <input
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                         text-stone-200 focus:border-stone-500 focus:outline-none"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">카테고리</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_KO[c]}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">희귀도</span>
          <select
            value={form.rarity}
            onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
          >
            {RARITIES.map((r) => <option key={r} value={r}>{RARITY_KO[r]}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">설명 (한국어)</span>
          <textarea
            rows={3}
            value={form.descriptionKo}
            onChange={(e) => setForm((f) => ({ ...f, descriptionKo: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                       text-stone-200 focus:border-stone-500 focus:outline-none resize-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-stone-500">설명 (English)</span>
          <textarea
            rows={3}
            value={form.descriptionEn}
            onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
            className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm
                       text-stone-200 focus:border-stone-500 focus:outline-none resize-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-stone-500">iconUrl (선택)</span>
        <input
          value={form.iconUrl}
          onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
          className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200"
          placeholder="https://..."
        />
      </label>

      {status && (
        <p className={`text-sm ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <button
        onClick={submit}
        disabled={loading || !form.slug || !form.nameKo || !form.nameEn}
        className="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white
                   transition-colors hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '저장 중...' : '아이템 저장'}
      </button>
    </div>
  )
}

// ── Sync Panel ──────────────────────────────────────────────────────────────

function SyncPanel({ adminSecret }: { adminSecret: string }) {
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const syncSearch = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/admin/sync-search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminSecret}` },
      })
      const data = await res.json()
      setStatus(res.ok
        ? { ok: true, msg: `✅ Meilisearch 동기화 완료 (${data.durationMs}ms)` }
        : { ok: false, msg: `❌ ${data.error}` }
      )
    } catch {
      setStatus({ ok: false, msg: '❌ 네트워크 오류' })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-stone-100">검색 인덱스 동기화</h2>
      <p className="text-sm text-stone-500">
        DB 데이터 전체를 Meilisearch에 재동기화합니다. 대량 데이터 입력 후 실행하세요.
      </p>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}
      <button
        onClick={syncSearch}
        disabled={loading}
        className="rounded-lg border border-stone-600 bg-stone-800 px-5 py-2.5 text-sm
                   font-semibold text-stone-200 transition-colors hover:bg-stone-700
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '동기화 중...' : '🔄 전체 동기화'}
      </button>
    </div>
  )
}

// ── Main AdminPanel ──────────────────────────────────────────────────────────

export function AdminPanel({ adminSecret }: Props) {
  const [tab, setTab] = useState<Tab>('boss')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'boss',  label: '⚔️ 보스' },
    { key: 'item',  label: '🗡️ 아이템' },
    { key: 'sync',  label: '🔄 동기화' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-100">관리자 패널</h1>
        <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">ADMIN</span>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 rounded-xl border border-stone-800 bg-stone-900 p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors
                        ${tab === key
                          ? 'bg-stone-800 text-stone-100'
                          : 'text-stone-500 hover:text-stone-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-6">
        {tab === 'boss' && <BossForm adminSecret={adminSecret} />}
        {tab === 'item' && <ItemForm adminSecret={adminSecret} />}
        {tab === 'sync' && <SyncPanel adminSecret={adminSecret} />}
      </div>
    </div>
  )
}
