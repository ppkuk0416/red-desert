import { Badge } from '@red-desert/ui/components/Badge'
import type { ItemRarity } from '@red-desert/db'
import Link from 'next/link'

type DropRow = {
  isGuaranteed: boolean
  dropRate: number | null
  quantity: number
  item: {
    id: string
    slug: string
    nameKo: string
    nameEn: string
    rarity: ItemRarity
    category: string
    iconUrl: string | null
  }
}

type Props = {
  drops: DropRow[]
  locale: string
}

const RARITY_VARIANT: Record<ItemRarity, 'crimson' | 'sand' | 'default' | 'success' | 'warning'> = {
  COMMON: 'default',
  UNCOMMON: 'success',
  RARE: 'sand',
  EPIC: 'crimson',
  LEGENDARY: 'crimson',
}

const RARITY_KO: Record<ItemRarity, string> = {
  COMMON: '일반',
  UNCOMMON: '고급',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
}

export function DropTable({ drops, locale }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-800 bg-stone-900/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              아이템
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
              희귀도
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">
              드랍률
            </th>
          </tr>
        </thead>
        <tbody>
          {drops.map((drop) => {
            const name = locale === 'ko' ? drop.item.nameKo : drop.item.nameEn
            return (
              <tr
                key={drop.item.id}
                className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/item/${drop.item.slug}`}
                    className="flex items-center gap-2.5 group"
                  >
                    {/* 아이콘 */}
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-stone-700 flex items-center justify-center text-sm">
                      {drop.item.iconUrl ? (
                        <img
                          src={drop.item.iconUrl}
                          alt={name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        '🗡️'
                      )}
                    </div>
                    <span className="font-medium text-stone-200 group-hover:text-crimson-400 transition-colors">
                      {name}
                    </span>
                    {drop.isGuaranteed && (
                      <Badge variant="success" className="text-xs">
                        확정
                      </Badge>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={RARITY_VARIANT[drop.item.rarity]}>
                    {RARITY_KO[drop.item.rarity]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {drop.isGuaranteed ? (
                    <span className="text-green-400 font-semibold">100%</span>
                  ) : drop.dropRate !== null ? (
                    <span className="text-stone-300">
                      {(drop.dropRate * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-stone-600">미확인</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
