import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getBossList } from '@/lib/queries/boss'
import { BossGrid } from '@/components/boss/BossGrid'
import { BossFilters } from '@/components/boss/BossFilters'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; region?: string; difficulty?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BossPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function BossListPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q, region, difficulty } = await searchParams
  const t = await getTranslations({ locale, namespace: 'BossPage' })

  const bosses = await getBossList({
    q,
    region: region as string | undefined,
    difficulty: difficulty ? Number(difficulty) : undefined,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-100">{t('title')}</h1>
        <p className="mt-1 text-stone-400">{t('meta.description')}</p>
      </div>

      {/* 검색 + 필터 */}
      <Suspense>
        <BossFilters locale={locale} />
      </Suspense>

      {/* 결과 카운트 */}
      <p className="mb-6 text-sm text-stone-500">
        {bosses.length}개 보스
        {q && (
          <span className="ml-2 text-crimson-400">
            — &quot;{q}&quot; 검색 결과
          </span>
        )}
      </p>

      {/* 그리드 */}
      {bosses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-600">
          <span className="mb-3 text-5xl">🗡️</span>
          <p className="text-lg">{t('empty')}</p>
        </div>
      ) : (
        <BossGrid bosses={bosses} locale={locale} />
      )}
    </div>
  )
}
