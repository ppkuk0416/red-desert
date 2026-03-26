import type { WeaponType, BossMechanic, Region } from '@red-desert/db'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import Link from 'next/link'

export type BossCardData = {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  region: Region
  difficulty: number
  thumbnailUrl: string | null
  weaknesses: WeaponType[]
  mechanics: BossMechanic[]
  communityRating: number | null
  dropCount: number
}

type Props = {
  boss: BossCardData
  locale: string
}

const DIFFICULTY_LABEL = ['', '쉬움', '보통', '어려움', '매우 어려움', '최고 난이도']
const DIFFICULTY_COLOR = ['', 'success', 'success', 'warning', 'crimson', 'crimson'] as const

const MECHANIC_LABEL: Record<BossMechanic, string> = {
  PARRY: '패리',
  COUNTER: '카운터',
  CLIMB: '등반',
  SUMMON: '소환',
  ELEMENTAL: '속성',
  MOUNTED: '마운트',
}

const REGION_LABEL: Record<Region, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}

export function BossCard({ boss, locale }: Props) {
  const name = locale === 'ko' ? boss.nameKo : boss.nameEn
  const diffLabel = DIFFICULTY_LABEL[boss.difficulty] ?? '?'
  const diffColor = DIFFICULTY_COLOR[boss.difficulty] ?? 'default'

  return (
    <Link href={`/${locale}/boss/${boss.slug}`} className="group block">
      <Card className="h-full group-hover:border-crimson-700 transition-all duration-200">
        {/* 썸네일 */}
        <div className="relative mb-4 h-36 w-full overflow-hidden rounded-lg bg-stone-800">
          {boss.thumbnailUrl ? (
            <img
              src={boss.thumbnailUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl opacity-30">
              ⚔️
            </div>
          )}
          {/* 난이도 배지 */}
          <div className="absolute right-2 top-2">
            <Badge variant={diffColor}>{'★'.repeat(boss.difficulty)}</Badge>
          </div>
        </div>

        {/* 이름 */}
        <h3 className="mb-1 font-bold text-stone-100 group-hover:text-crimson-400 transition-colors truncate">
          {name}
        </h3>

        {/* 지역 */}
        <p className="mb-3 text-xs text-stone-500">{REGION_LABEL[boss.region]}</p>

        {/* 약점 */}
        {boss.weaknesses.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {boss.weaknesses.slice(0, 3).map((w) => (
              <Badge key={w} variant="sand" className="text-xs">
                {weaponLabel[w]}
              </Badge>
            ))}
            {boss.weaknesses.length > 3 && (
              <Badge variant="default" className="text-xs">
                +{boss.weaknesses.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 메커닉 태그 */}
        {boss.mechanics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {boss.mechanics.slice(0, 2).map((m) => (
              <span key={m} className="text-xs text-stone-600">
                #{MECHANIC_LABEL[m]}
              </span>
            ))}
          </div>
        )}

        {/* 하단 정보 */}
        <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-3 text-xs text-stone-500">
          <span>드랍 {boss.dropCount}종</span>
          {boss.communityRating !== null && boss.communityRating > 0 && (
            <span className="text-yellow-500">
              ★ {boss.communityRating.toFixed(1)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}

const weaponLabel: Record<WeaponType, string> = {
  SWORD_SHIELD: '검+방패',
  GREATSWORD: '대검',
  SPEAR: '창',
  DAGGER: '단검',
  BOW: '활',
  CROSSBOW: '석궁',
  STAFF: '지팡이',
  SCYTHE: '낫',
  HAMMER: '망치',
  FLAIL: '도리깨',
  TWIN_SWORDS: '쌍검',
  BARE_HANDS: '맨손',
  SPECIAL: '특수',
}
