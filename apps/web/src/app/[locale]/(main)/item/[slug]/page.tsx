import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getItemDetail, getAllItemSlugs } from '@/lib/queries/item'
import { Badge } from '@red-desert/ui/components/Badge'
import { DifficultyStars } from '@red-desert/ui/components/DifficultyStars'
import {
  RARITY_KO,
  RARITY_VARIANT,
  RARITY_BORDER,
  CATEGORY_KO,
  CATEGORY_ICON,
} from '@red-desert/ui/item/card'
import { BossDropSources } from '@/components/item/BossDropSources'
import { OtherDropSources } from '@/components/item/OtherDropSources'
import { CraftRecipeSection } from '@/components/item/CraftRecipeSection'
import { UsedInSection } from '@/components/item/UsedInSection'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug, locale } = await params
    const item = await getItemDetail(slug)
    if (!item) return {}
    const name = locale === 'ko' ? item.nameKo : item.nameEn
    return {
      title: `${name} — 드랍 위치 & 정보`,
      description: `${name}의 드랍처, 획득 방법, 제작 레시피.`,
    }
  } catch {
    return {}
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await getAllItemSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

const DROP_SOURCE_KO: Record<string, string> = {
  BOSS: '보스',
  MONSTER: '몬스터',
  CRAFT: '제작',
  NPC: 'NPC',
  EXPLORATION: '탐험',
  TRADE: '거래',
}

const REGION_KO: Record<string, string> = {
  PYWEL_CASTLE: '파이웰 성',
  THORNWOOD: '손우드',
  ASHEN_WASTES: '잿빛 황야',
  FROZEN_HIGHLANDS: '설원 고원',
  VERDANT_COAST: '녹지 해안',
}

export default async function ItemDetailPage({ params }: Props) {
  const { slug, locale } = await params
  const item = await getItemDetail(slug)

  if (!item) notFound()

  const name = locale === 'ko' ? item.nameKo : item.nameEn
  const desc = locale === 'ko' ? item.descriptionKo : item.descriptionEn
  const totalSources = item.bossDrops.length + item.dropSources.length

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* 뒤로가기 */}
      <a
        href={`/${locale}/item`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-300"
      >
        ← 아이템 목록으로
      </a>

      {/* 헤더 */}
      <div className={`mb-8 flex flex-col gap-5 rounded-2xl border bg-stone-900/60 p-6
                        sm:flex-row sm:items-start ${RARITY_BORDER[item.rarity]}`}>
        {/* 아이콘 */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center
                        rounded-2xl bg-stone-800 text-5xl mx-auto sm:mx-0">
          {item.iconUrl ? (
            <img src={item.iconUrl} alt={name} className="h-full w-full rounded-2xl object-cover" />
          ) : (
            <span>{CATEGORY_ICON[item.category]}</span>
          )}
        </div>

        {/* 텍스트 */}
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-stone-100">{name}</h1>
            <Badge variant={RARITY_VARIANT[item.rarity]}>
              {RARITY_KO[item.rarity]}
            </Badge>
          </div>

          {locale === 'ko' && item.nameEn && (
            <p className="mb-2 text-stone-500 text-sm">{item.nameEn}</p>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="default">{CATEGORY_KO[item.category]}</Badge>
            {item.codexId && (
              <Badge variant="default" className="font-mono text-xs">
                Codex #{item.codexId}
              </Badge>
            )}
          </div>

          {desc && (
            <p className="text-sm text-stone-400 leading-relaxed">{desc}</p>
          )}
        </div>
      </div>

      {/* 획득 방법 요약 배너 */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatBox
          label="보스 드랍"
          value={item.bossDrops.length}
          active={item.bossDrops.length > 0}
        />
        <StatBox
          label="기타 드랍처"
          value={item.dropSources.length}
          active={item.dropSources.length > 0}
        />
        <StatBox
          label="제작 레시피"
          value={item.craftedFrom.length}
          active={item.craftedFrom.length > 0}
        />
      </div>

      {/* 보스 드랍 (역방향 조회 핵심) */}
      {item.bossDrops.length > 0 && (
        <section className="mb-10">
          <SectionTitle>보스 드랍</SectionTitle>
          <BossDropSources drops={item.bossDrops} locale={locale} />
        </section>
      )}

      {/* 기타 드랍처 */}
      {item.dropSources.length > 0 && (
        <section className="mb-10">
          <SectionTitle>기타 획득처</SectionTitle>
          <OtherDropSources sources={item.dropSources} locale={locale} />
        </section>
      )}

      {/* 제작 레시피 */}
      {item.craftedFrom.length > 0 && (
        <section className="mb-10">
          <SectionTitle>제작 레시피</SectionTitle>
          <CraftRecipeSection recipes={item.craftedFrom} locale={locale} />
        </section>
      )}

      {/* 이 아이템을 재료로 쓰는 레시피 */}
      {item.usedInCraft.length > 0 && (
        <section className="mb-10">
          <SectionTitle>제작 재료로 사용됨</SectionTitle>
          <UsedInSection usages={item.usedInCraft} locale={locale} />
        </section>
      )}

      {/* 획득처 없음 */}
      {totalSources === 0 && item.craftedFrom.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-700 p-10 text-center text-stone-600">
          <p className="text-2xl mb-2">🔍</p>
          <p>획득 방법 데이터를 수집 중입니다.</p>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-stone-100">
      <span className="h-5 w-1 rounded-full bg-crimson-600" />
      {children}
    </h2>
  )
}

function StatBox({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 text-center transition-colors
                  ${active ? 'border-crimson-800 bg-crimson-950/30' : 'border-stone-800 bg-stone-900/30'}`}
    >
      <div className={`text-2xl font-bold ${active ? 'text-crimson-400' : 'text-stone-700'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-stone-500">{label}</div>
    </div>
  )
}
