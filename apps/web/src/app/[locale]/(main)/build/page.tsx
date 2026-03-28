import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { BuildFilters } from '@/components/build/BuildFilters'
import { BuildGrid } from '@/components/build/BuildGrid'
import { getBuildList, getBuildWeaponOptions } from '@/lib/queries/build'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ character?: string; weapon?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BuildPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function BuildPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { character = '', weapon = '', sort = 'upvotes' } = await searchParams
  const t = await getTranslations({ locale, namespace: 'BuildPage' })

  const [builds, weaponOptions] = await Promise.all([
    getBuildList({ character, weapon, sort: sort as 'upvotes' | 'latest' }).catch(() => []),
    getBuildWeaponOptions().catch(() => []),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-100">{t('title')}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {builds.length > 0
            ? `${builds.length}개 빌드`
            : '커뮤니티 빌드를 탐색하고 나만의 최적 빌드를 찾아보세요.'}
        </p>
      </div>

      {/* Filters — wrapped in Suspense (useSearchParams requirement) */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 rounded-xl bg-stone-800/50 animate-pulse" />}>
          <BuildFilters
            weaponOptions={weaponOptions}
            character={character}
            weapon={weapon}
            sort={sort}
          />
        </Suspense>
      </div>

      {/* Build grid */}
      <BuildGrid builds={builds} locale={locale} />
    </div>
  )
}
