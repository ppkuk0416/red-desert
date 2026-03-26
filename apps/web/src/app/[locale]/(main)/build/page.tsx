import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'BuildPage' })
  return { title: t('meta.title'), description: t('meta.description') }
}

export default async function BuildPage() {
  const t = await getTranslations('BuildPage')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      {/* TODO: 캐릭터 탭 (Kliff / Damiane / Oongka) */}
      {/* TODO: 무기 타입 필터 */}
      {/* TODO: BuildGrid 컴포넌트 */}
      <div className="text-stone-500 text-center py-20">
        빌드 데이터 입력 후 메타 빌드가 표시됩니다.
      </div>
    </div>
  )
}
