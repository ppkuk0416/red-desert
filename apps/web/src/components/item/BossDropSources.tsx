import { Badge } from '@red-desert/ui/components/Badge'
import { DifficultyStars } from '@red-desert/ui/components/DifficultyStars'
import Link from 'next/link'

type BossDrop = {
  dropRate: number | null
  isGuaranteed: boolean
  boss: {
    id: string
    slug: string
    nameKo: string
    nameEn: string
    region: string
    difficulty: number
    thumbnailUrl: string | null
  }
}

type Props = { drops: BossDrop[]; locale: string }

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}

export function BossDropSources({ drops, locale }: Props) {
  return (
    <div className="space-y-3">
      {drops.map((drop) => {
        const bossName = locale === 'ko' ? drop.boss.nameKo : drop.boss.nameEn
        return (
          <Link
            key={drop.boss.id}
            href={`/${locale}/boss/${drop.boss.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-stone-800
                       bg-stone-900 p-4 hover:border-crimson-700 hover:bg-stone-800 transition-all"
          >
            {/* 보스 썸네일 */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-800 flex items-center justify-center text-2xl">
              {drop.boss.thumbnailUrl ? (
                <img
                  src={drop.boss.thumbnailUrl}
                  alt={bossName}
                  className="h-full w-full object-cover"
                />
              ) : (
                '⚔️'
              )}
            </div>

            {/* 보스 정보 */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-200 group-hover:text-crimson-400 transition-colors truncate">
                {bossName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-stone-500">
                  {REGION_KO[drop.boss.region] ?? drop.boss.region}
                </span>
                <DifficultyStars value={drop.boss.difficulty} />
              </div>
            </div>

            {/* 드랍률 */}
            <div className="shrink-0 text-right">
              {drop.isGuaranteed ? (
                <Badge variant="success">확정 드랍</Badge>
              ) : drop.dropRate !== null ? (
                <span className="text-lg font-bold font-mono text-stone-300">
                  {(drop.dropRate * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-sm text-stone-600">드랍률 미확인</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
