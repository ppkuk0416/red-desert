import type { Metadata } from 'next'
import { BuildCreateForm } from '@/components/build/BuildCreateForm'

type Props = { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: '빌드 작성',
  description: '나만의 붉은사막 빌드를 커뮤니티에 공유하세요.',
}

export default async function BuildNewPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <a
          href={`/${locale}/build`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-300"
        >
          ← 빌드 목록으로
        </a>
        <h1 className="text-3xl font-bold text-stone-100">빌드 작성</h1>
        <p className="mt-1 text-sm text-stone-500">
          나만의 빌드를 공유하고 커뮤니티의 피드백을 받아보세요.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
        <BuildCreateForm locale={locale} />
      </div>
    </div>
  )
}
