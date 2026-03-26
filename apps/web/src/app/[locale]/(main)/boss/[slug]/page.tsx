import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBossDetail, getAllBossSlugs } from '@/lib/queries/boss'
import { Badge } from '@red-desert/ui/components/Badge'
import { DifficultyStars } from '@red-desert/ui/components/DifficultyStars'
import { DropTable } from '@/components/boss/DropTable'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const boss = await getBossDetail(slug)
  if (!boss) return {}

  const name = locale === 'ko' ? boss.nameKo : boss.nameEn
  return {
    title: `${name} 공략`,
    description: `${name} 보스 약점, 드랍 아이템, 공략 가이드. 메커닉: ${boss.mechanics.join(', ')}`,
  }
}

export async function generateStaticParams() {
  const slugs = await getAllBossSlugs()
  return slugs.map((slug) => ({ slug }))
}

const MECHANIC_KO: Record<string, string> = {
  PARRY: '패리',
  COUNTER: '카운터',
  CLIMB: '등반',
  SUMMON: '소환',
  ELEMENTAL: '속성',
  MOUNTED: '마운트',
}

const WEAPON_KO: Record<string, string> = {
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

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}

export default async function BossDetailPage({ params }: Props) {
  const { slug, locale } = await params
  const boss = await getBossDetail(slug)

  if (!boss) notFound()

  const name = locale === 'ko' ? boss.nameKo : boss.nameEn

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* 뒤로가기 */}
      <a
        href={`/${locale}/boss`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-300"
      >
        ← 보스 목록으로
      </a>

      {/* 헤더 섹션 */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* 썸네일 */}
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-stone-800 flex items-center justify-center text-5xl">
          {boss.thumbnailUrl ? (
            <img src={boss.thumbnailUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            '⚔️'
          )}
        </div>

        {/* 기본 정보 */}
        <div className="flex-1">
          <h1 className="mb-1 text-4xl font-bold text-stone-100">{name}</h1>
          {locale === 'ko' && (
            <p className="mb-3 text-stone-500">{boss.nameEn}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="default">{REGION_KO[boss.region] ?? boss.region}</Badge>
            <DifficultyStars value={boss.difficulty} />
          </div>

          {/* 약점 */}
          {boss.weaknesses.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
                약점 무기
              </p>
              <div className="flex flex-wrap gap-1.5">
                {boss.weaknesses.map((w) => (
                  <Badge key={w} variant="crimson">
                    {WEAPON_KO[w] ?? w}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 메커닉 */}
          {boss.mechanics.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
                전투 메커닉
              </p>
              <div className="flex flex-wrap gap-1.5">
                {boss.mechanics.map((m) => (
                  <Badge key={m} variant="sand">
                    {MECHANIC_KO[m] ?? m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <hr className="border-stone-800 mb-8" />

      {/* 드랍 테이블 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-stone-100">
          드랍 아이템
          <span className="ml-2 text-sm font-normal text-stone-500">
            ({boss.drops.length}종)
          </span>
        </h2>
        {boss.drops.length > 0 ? (
          <DropTable drops={boss.drops} locale={locale} />
        ) : (
          <p className="text-stone-600">드랍 아이템 데이터를 준비 중입니다.</p>
        )}
      </section>

      {/* 공략 팁 (TODO: 커뮤니티 기여 영역) */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-stone-100">공략 팁</h2>
        <div className="rounded-xl border border-dashed border-stone-700 p-8 text-center text-stone-600">
          <p className="mb-2 text-2xl">✍️</p>
          <p>커뮤니티 공략 기여 기능이 준비 중입니다.</p>
        </div>
      </section>
    </div>
  )
}
