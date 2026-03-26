import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'MapPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function MapPage() {
  const t = await getTranslations('MapPage')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      {/* TODO: 마커 타입 필터 토글 */}
      {/* TODO: Leaflet 지도 컴포넌트 (client-only dynamic import) */}
      <div className="text-stone-500 text-center py-20 border border-dashed border-stone-700 rounded-xl">
        지도 타일 준비 후 인터랙티브 맵이 표시됩니다.
      </div>
    </div>
  )
}
