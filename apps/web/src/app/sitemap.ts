import type { MetadataRoute } from 'next'
import { getAllBossSlugs } from '@/lib/queries/boss'
import { getAllItemSlugs } from '@/lib/queries/item'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://red-desert.gg'
const LOCALES = ['ko', 'en'] as const

type SitemapEntry = MetadataRoute.Sitemap[number]

function staticEntry(path: string, priority: number, freq: SitemapEntry['changeFrequency']): SitemapEntry[] {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`])
      ),
    },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const statics: SitemapEntry[] = [
    ...staticEntry('',       1.0, 'daily'),
    ...staticEntry('/boss',  0.9, 'daily'),
    ...staticEntry('/item',  0.9, 'daily'),
    ...staticEntry('/map',   0.8, 'weekly'),
    ...staticEntry('/build', 0.8, 'weekly'),
  ]

  // 보스 상세 페이지 (DB에서 동적 생성)
  const bossSlugs = await getAllBossSlugs().catch(() => [] as string[])
  const bossEntries: SitemapEntry[] = bossSlugs.flatMap((slug) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/boss/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/boss/${slug}`])
        ),
      },
    }))
  )

  // 아이템 상세 페이지
  const itemSlugs = await getAllItemSlugs().catch(() => [] as string[])
  const itemEntries: SitemapEntry[] = itemSlugs.flatMap((slug) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/item/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.80,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/item/${slug}`])
        ),
      },
    }))
  )

  return [...statics, ...bossEntries, ...itemEntries]
}
