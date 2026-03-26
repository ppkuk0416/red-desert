import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ItemPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function ItemListPage() {
  const t = await getTranslations('ItemPage')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-stone-400 mb-8">{t('meta.description')}</p>
      {/* TODO: 검색 + 카테고리/희귀도 필터 */}
      {/* TODO: ItemTable 컴포넌트 */}
      <div className="text-stone-500 text-center py-20">
        데이터 입력 후 아이템 목록이 표시됩니다.
      </div>
    </div>
  )
}
