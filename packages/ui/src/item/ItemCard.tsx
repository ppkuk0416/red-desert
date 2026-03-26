import type { ItemCategory, ItemRarity } from '@red-desert/db'
import { Badge } from '../components/Badge'
import Link from 'next/link'

export type ItemCardData = {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  category: ItemCategory
  rarity: ItemRarity
  iconUrl: string | null
  dropSourceCount: number
  isCraftable: boolean
}

type Props = {
  item: ItemCardData
  locale: string
}

export const RARITY_VARIANT: Record<
  ItemRarity,
  'default' | 'success' | 'sand' | 'crimson' | 'warning'
> = {
  COMMON: 'default',
  UNCOMMON: 'success',
  RARE: 'sand',
  EPIC: 'crimson',
  LEGENDARY: 'warning',
}

export const RARITY_KO: Record<ItemRarity, string> = {
  COMMON: '일반',
  UNCOMMON: '고급',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
}

export const RARITY_BORDER: Record<ItemRarity, string> = {
  COMMON: 'border-stone-700',
  UNCOMMON: 'border-green-800',
  RARE: 'border-sand-700',
  EPIC: 'border-crimson-700',
  LEGENDARY: 'border-yellow-600',
}

export const CATEGORY_KO: Record<ItemCategory, string> = {
  WEAPON: '무기',
  ARMOR: '방어구',
  MATERIAL: '재료',
  CONSUMABLE: '소비',
  ABYSS_ARTIFACT: '심연 유물',
  COLLECTIBLE: '수집품',
  QUEST: '퀘스트',
  TRADE_GOOD: '거래 상품',
}

export const CATEGORY_ICON: Record<ItemCategory, string> = {
  WEAPON: '⚔️',
  ARMOR: '🛡️',
  MATERIAL: '🪨',
  CONSUMABLE: '🧪',
  ABYSS_ARTIFACT: '💠',
  COLLECTIBLE: '🔔',
  QUEST: '📜',
  TRADE_GOOD: '📦',
}

export function ItemCard({ item, locale }: Props) {
  const name = locale === 'ko' ? item.nameKo : item.nameEn

  return (
    <Link href={`/${locale}/item/${item.slug}`} className="group block">
      <div
        className={`rounded-xl border bg-stone-900 p-4 transition-all duration-200
                    hover:bg-stone-800 ${RARITY_BORDER[item.rarity]}
                    group-hover:shadow-lg group-hover:shadow-crimson-900/20`}
      >
        {/* 아이콘 + 희귀도 */}
        <div className="relative mb-3 flex h-16 w-16 items-center justify-center
                        rounded-xl bg-stone-800 text-3xl mx-auto">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            <span>{CATEGORY_ICON[item.category]}</span>
          )}
        </div>

        {/* 이름 */}
        <p className="mb-1 text-center text-sm font-semibold text-stone-200
                      group-hover:text-crimson-400 transition-colors leading-tight line-clamp-2">
          {name}
        </p>

        {/* 뱃지 행 */}
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          <Badge variant={RARITY_VARIANT[item.rarity]} className="text-xs">
            {RARITY_KO[item.rarity]}
          </Badge>
          <Badge variant="default" className="text-xs">
            {CATEGORY_KO[item.category]}
          </Badge>
        </div>

        {/* 드랍처 / 제작 여부 */}
        <div className="mt-2 flex justify-center gap-2 text-xs text-stone-600">
          {item.dropSourceCount > 0 && (
            <span>드랍 {item.dropSourceCount}곳</span>
          )}
          {item.isCraftable && (
            <span className="text-sand-600">제작 가능</span>
          )}
        </div>
      </div>
    </Link>
  )
}
