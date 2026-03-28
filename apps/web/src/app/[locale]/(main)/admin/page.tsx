import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { AdminPanel } from '@/components/admin/AdminPanel'

export const metadata: Metadata = { title: '관리자 패널', robots: { index: false, follow: false } }

/**
 * /admin 페이지는 NEXT_PUBLIC_ADMIN_KEY 쿠키 또는 ?key= 쿼리로 접근 제어.
 * 실제 인증은 API 레이어(ADMIN_SECRET Bearer)에서 한 번 더 검증함.
 */
type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ key?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY

  // NEXT_PUBLIC_ADMIN_KEY 미설정이거나 key 불일치 → 404로 위장
  if (!adminKey || key !== adminKey) notFound()

  return <AdminPanel adminSecret={key} />
}
