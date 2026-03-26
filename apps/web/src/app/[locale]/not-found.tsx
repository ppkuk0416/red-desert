import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('NotFound')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-crimson-600 mb-4">404</h1>
      <p className="text-xl text-stone-400">{t('message')}</p>
    </div>
  )
}
