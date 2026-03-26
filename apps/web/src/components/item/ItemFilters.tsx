import { SearchBar } from '@red-desert/ui/components/SearchBar'
import { FilterSelect } from '@red-desert/ui/components/FilterSelect'

const CATEGORY_OPTIONS = [
  { value: 'WEAPON', label: '⚔️ 무기' },
  { value: 'ARMOR', label: '🛡️ 방어구' },
  { value: 'MATERIAL', label: '🪨 재료' },
  { value: 'CONSUMABLE', label: '🧪 소비' },
  { value: 'ABYSS_ARTIFACT', label: '💠 심연 유물' },
  { value: 'COLLECTIBLE', label: '🔔 수집품' },
  { value: 'TRADE_GOOD', label: '📦 거래 상품' },
]

const RARITY_OPTIONS = [
  { value: 'COMMON', label: '일반' },
  { value: 'UNCOMMON', label: '고급' },
  { value: 'RARE', label: '희귀' },
  { value: 'EPIC', label: '영웅' },
  { value: 'LEGENDARY', label: '전설' },
]

type Props = { locale: string }

export function ItemFilters({ locale: _locale }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <SearchBar placeholder="아이템 이름 검색..." paramKey="q" />
      </div>
      <div className="flex gap-3">
        <FilterSelect label="카테고리" options={CATEGORY_OPTIONS} paramKey="category" />
        <FilterSelect label="희귀도" options={RARITY_OPTIONS} paramKey="rarity" />
      </div>
    </div>
  )
}
