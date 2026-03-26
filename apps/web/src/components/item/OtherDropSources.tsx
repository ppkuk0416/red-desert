import { Badge } from '@red-desert/ui/components/Badge'

type DropSource = {
  id: string
  sourceType: string
  sourceName: string
  region: string | null
  dropRate: number | null
  notes: string | null
}

type Props = { sources: DropSource[]; locale: string }

const SOURCE_TYPE_KO: Record<string, string> = {
  MONSTER: '몬스터',
  NPC: 'NPC',
  EXPLORATION: '탐험',
  TRADE: '거래',
  CRAFT: '제작',
  BOSS: '보스',
}

const SOURCE_TYPE_ICON: Record<string, string> = {
  MONSTER: '👾',
  NPC: '🧑',
  EXPLORATION: '🗺️',
  TRADE: '🪙',
  CRAFT: '⚒️',
  BOSS: '⚔️',
}

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}

export function OtherDropSources({ sources, locale: _locale }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-800 bg-stone-900/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              출처
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              지역
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">
              드랍률
            </th>
          </tr>
        </thead>
        <tbody>
          {sources.map((src) => (
            <tr
              key={src.id}
              className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {SOURCE_TYPE_ICON[src.sourceType] ?? '❓'}
                  </span>
                  <div>
                    <p className="font-medium text-stone-200">{src.sourceName}</p>
                    <p className="text-xs text-stone-500">
                      {SOURCE_TYPE_KO[src.sourceType] ?? src.sourceType}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-stone-400">
                {src.region ? (REGION_KO[src.region] ?? src.region) : '—'}
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {src.dropRate !== null ? (
                  <span className="text-stone-300">
                    {(src.dropRate * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-stone-600">미확인</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
