import { useTranslations, useLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function HomePage() {
  const t = useTranslations('HomePage')
  const locale = useLocale()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 text-gradient-crimson">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-stone-400 mb-12">
          {t('hero.subtitle')}
        </p>

        {/* 빠른 접근 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['boss', 'item', 'map', 'build'] as const).map((section) => (
            <a
              key={section}
              href={`/${locale}/${section}`}
              className="group rounded-xl border border-stone-800 bg-stone-900 p-6
                         hover:border-crimson-700 hover:bg-stone-800 transition-all duration-200"
            >
              <div className="text-2xl mb-2">{sectionIcon[section]}</div>
              <div className="font-semibold text-stone-200 group-hover:text-crimson-400 transition-colors">
                {t(`nav.${section}`)}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}

const sectionIcon = {
  boss: '⚔️',
  item: '🗡️',
  map: '🗺️',
  build: '🔧',
}
