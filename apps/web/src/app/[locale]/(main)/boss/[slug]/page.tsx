import { notFound } from 'next/navigation'
import { prisma } from '@red-desert/db'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const boss = await prisma.boss.findUnique({ where: { slug } })
  if (!boss) return {}

  const name = locale === 'ko' ? boss.nameKo : boss.nameEn
  return {
    title: `${name} 공략`,
    description: `${name} 보스 약점, 드랍 아이템, 공략 가이드.`,
  }
}

export default async function BossDetailPage({ params }: Props) {
  const { slug, locale } = await params

  const boss = await prisma.boss.findUnique({
    where: { slug },
    include: {
      drops: { include: { item: true } },
      mapMarkers: true,
    },
  })

  if (!boss) notFound()

  const name = locale === 'ko' ? boss.nameKo : boss.nameEn

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">{name}</h1>
      <div className="flex gap-2 mb-8">
        {/* TODO: 난이도 Badge, 지역 Badge, 약점 Badge */}
      </div>

      {/* TODO: 보스 공략 섹션 */}
      {/* TODO: 드랍 테이블 섹션 */}
      {/* TODO: 지도 마커 */}
    </div>
  )
}
