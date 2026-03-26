import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { SearchProvider } from '@/components/search/SearchProvider'
import '../globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: {
    template: '%s | 붉은사막 DB',
    default: '붉은사막 DB — 보스, 아이템, 지도, 빌드',
  },
  description:
    '붉은사막(Crimson Desert) 보스 공략, 아이템 드랍 테이블, 인터랙티브 지도, 빌드 플래너를 한 곳에서.',
  openGraph: {
    siteName: '붉은사막 DB',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
  },
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'ko' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SearchProvider>
            {children}
          </SearchProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
