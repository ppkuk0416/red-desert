import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BossPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function BossListPage() {
  const t = await getTranslations('BossPage')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-stone-400 mb-8">{t('meta.description')}</p>

      {/* TODO: 검색 + 필터 컴포넌트 */}
      {/* TODO: BossGrid 컴포넌트 */}
      <div className="text-stone-500 text-center py-20">
        데이터 입력 후 보스 목록이 표시됩니다.
      </div>
    </div>
  )
}
