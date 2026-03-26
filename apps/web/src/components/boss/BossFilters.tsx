import { SearchBar } from '@red-desert/ui/components/SearchBar'
import { FilterSelect } from '@red-desert/ui/components/FilterSelect'

const REGION_OPTIONS = [
  { value: 'PYWEL_CASTLE', label: '파이웰 성' },
  { value: 'THORNWOOD', label: '손우드' },
  { value: 'ASHEN_WASTES', label: '잿빛 황야' },
  { value: 'FROZEN_HIGHLANDS', label: '설원 고원' },
  { value: 'VERDANT_COAST', label: '녹지 해안' },
]

const DIFFICULTY_OPTIONS = [
  { value: '1', label: '★ 쉬움' },
  { value: '2', label: '★★ 보통' },
  { value: '3', label: '★★★ 어려움' },
  { value: '4', label: '★★★★ 매우 어려움' },
  { value: '5', label: '★★★★★ 최고 난이도' },
]

type Props = { locale: string }

export function BossFilters({ locale: _locale }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <SearchBar placeholder="보스 이름 검색..." paramKey="q" />
      </div>
      <div className="flex gap-3">
        <FilterSelect label="지역" options={REGION_OPTIONS} paramKey="region" />
        <FilterSelect label="난이도" options={DIFFICULTY_OPTIONS} paramKey="difficulty" />
      </div>
    </div>
  )
}
