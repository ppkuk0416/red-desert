import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MapClient } from '@/components/map/MapClient'
import { getMapMarkers } from '@/lib/queries/map'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'MapPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'MapPage' })

  let markers = await getMapMarkers().catch(() => [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-100">{t('title')}</h1>
          {markers.length > 0 && (
            <p className="mt-1 text-sm text-stone-500">
              {t('markerCount', { count: markers.length })}
            </p>
          )}
        </div>
      </div>

      {markers.length === 0 ? (
        /* Placeholder when no DB data ─────────────────────────────────── */
        <div className="rounded-xl border border-dashed border-stone-700 p-16 text-center">
          <p className="mb-2 text-3xl">🗺️</p>
          <p className="text-stone-500">마커 데이터를 로드할 수 없습니다.</p>
          <p className="mt-1 text-xs text-stone-700">DB 연결 및 seed 실행 후 다시 시도해주세요.</p>
        </div>
      ) : (
        <MapClient markers={markers} locale={locale} />
      )}
    </div>
  )
}
