import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="border-t border-stone-800 bg-stone-950 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-stone-600">
        <p className="mb-1">
          <span className="font-semibold text-stone-400">붉은사막 DB</span>
          {' — '}
          {t('disclaimer')}
        </p>
        <p>{t('copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}
