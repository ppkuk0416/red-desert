import type { Metadata } from 'next'
import { LoginClient } from '@/components/auth/LoginClient'

export const metadata: Metadata = {
  title: '로그인',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; next?: string }>
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { error, next } = await searchParams

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <LoginClient locale={locale} error={error} next={next} />
    </div>
  )
}
