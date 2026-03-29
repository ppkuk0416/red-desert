import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { SearchProvider } from '@/components/search/SearchProvider'
import '../globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://red-desert.gg'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | 붉은사막 DB',
    default: '붉은사막 DB — 보스, 아이템, 지도, 빌드',
  },
  description:
    '붉은사막(Crimson Desert) 보스 공략, 아이템 드랍 테이블, 인터랙티브 지도, 빌드 플래너를 한 곳에서.',
  keywords: ['붉은사막', 'Crimson Desert', '붉은사막 DB', '붉은사막 공략', '붉은사막 보스', '붉은사막 아이템', 'Pearl Abyss'],
  authors: [{ name: '붉은사막 DB 커뮤니티' }],
  openGraph: {
    type: 'website',
    siteName: '붉은사막 DB',
    locale: 'ko_KR',
    alternateLocale: 'en_US',
    title: '붉은사막 DB — 보스, 아이템, 지도, 빌드',
    description: '붉은사막 보스 공략, 아이템 드랍 테이블, 인터랙티브 지도, 빌드 플래너를 한 곳에서.',
    images: [
      {
        url: `/api/og?title=붉은사막+DB&type=default`,
        width: 1200,
        height: 630,
        alt: '붉은사막 DB',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '붉은사막 DB — 보스, 아이템, 지도, 빌드',
    description: '붉은사막 보스 공략, 아이템 드랍 테이블, 인터랙티브 지도, 빌드 플래너를 한 곳에서.',
    images: [`/api/og?title=붉은사막+DB&type=default`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
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
