import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getItemList } from '@/lib/queries/item'
import { ItemGrid } from '@/components/item/ItemGrid'
import { ItemFilters } from '@/components/item/ItemFilters'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; category?: string; rarity?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ItemPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function ItemListPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { q, category, rarity } = await searchParams
  const t = await getTranslations({ locale, namespace: 'ItemPage' })

  const items = await getItemList({ q, category, rarity })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-100">{t('title')}</h1>
        <p className="mt-1 text-stone-400">{t('meta.description')}</p>
      </div>

      {/* 검색 + 필터 */}
      <Suspense>
        <ItemFilters locale={locale} />
      </Suspense>

      {/* 결과 카운트 */}
      <p className="mb-6 text-sm text-stone-500">
        {items.length}개 아이템
        {q && (
          <span className="ml-2 text-crimson-400">
            — &quot;{q}&quot; 검색 결과
          </span>
        )}
      </p>

      {/* 그리드 */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-600">
          <span className="mb-3 text-5xl">🗡️</span>
          <p className="text-lg">조건에 맞는 아이템이 없습니다.</p>
        </div>
      ) : (
        <ItemGrid items={items} locale={locale} />
      )}
    </div>
  )
}
