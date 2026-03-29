import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBuildDetail, getAllBuildSlugs } from '@/lib/queries/buildDetail'
import { Badge } from '@red-desert/ui/components/Badge'
import { LikeButton } from '@/components/build/LikeButton'
import { BookmarkButton } from '@/components/build/BookmarkButton'
import { CommentSection } from '@/components/build/CommentSection'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug, locale } = await params
    const build = await getBuildDetail(slug)
    if (!build) return {}
    const desc = build.descriptionKo ?? `${CHARACTER_KO[build.character]} ${WEAPON_KO[build.weaponPrimary]} 빌드`
    return {
      title: `${build.title} | 붉은사막 빌드`,
      description: desc.slice(0, 160),
      openGraph: {
        title: build.title,
        description: desc.slice(0, 160),
        images: [{ url: `/api/og?title=${encodeURIComponent(build.title)}&type=build`, width: 1200, height: 630 }],
      },
    }
  } catch {
    return {}
  }
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await getAllBuildSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

const CHARACTER_KO: Record<string, string> = {
  KLIFF: '클리프', DAMIANE: '다미아네', OONGKA: '웅카',
}

const WEAPON_KO: Record<string, string> = {
  SWORD_SHIELD: '검+방패', GREATSWORD: '대검', SPEAR: '창',
  DAGGER: '단검', BOW: '활', CROSSBOW: '석궁', STAFF: '지팡이',
  SCYTHE: '낫', HAMMER: '망치', FLAIL: '도리깨', TWIN_SWORDS: '쌍검',
  BARE_HANDS: '맨손', SPECIAL: '특수',
}

const PLAYSTYLE_KO: Record<string, string> = {
  MAIN_STORY: '메인 스토리', BOSS_HUNTER: '보스 헌터',
  COMPLETIONIST: '완벽주의', EXPLORER: '탐험가',
}

export default async function BuildDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const build = await getBuildDetail(slug)
  if (!build) notFound()

  const postedDate = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(build.createdAt)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 뒤로가기 */}
      <Link
        href={`/${locale}/build`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-300"
      >
        ← 빌드 목록으로
      </Link>

      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-stone-100">{build.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="default">{CHARACTER_KO[build.character] ?? build.character}</Badge>
          <Badge variant="crimson">{WEAPON_KO[build.weaponPrimary] ?? build.weaponPrimary}</Badge>
          {build.weaponSecondary && (
            <Badge variant="sand">{WEAPON_KO[build.weaponSecondary]}</Badge>
          )}
          <Badge variant="warning">{PLAYSTYLE_KO[build.playstyle] ?? build.playstyle}</Badge>
          {build.isVerified && <Badge variant="success">✓ 검증됨</Badge>}
        </div>

        {/* 작성자 + 날짜 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {build.author ? (
              <Link href={`/${locale}/profile/${build.author.id}`} className="flex items-center gap-2 hover:opacity-80">
                <div className="h-7 w-7 overflow-hidden rounded-full bg-stone-700 flex items-center justify-center text-xs">
                  {build.author.avatarUrl
                    ? <img src={build.author.avatarUrl} alt={build.author.username} className="h-full w-full object-cover" />
                    : '👤'}
                </div>
                <span className="text-sm font-medium text-stone-300">{build.author.username}</span>
              </Link>
            ) : (
              <span className="text-sm text-stone-600">익명</span>
            )}
            <span className="text-stone-700">·</span>
            <span className="text-sm text-stone-500">{postedDate}</span>
          </div>

          {/* 좋아요 / 북마크 */}
          <div className="flex items-center gap-2">
            <LikeButton buildId={build.id} initialCount={build._count.likes} />
            <BookmarkButton buildId={build.id} />
          </div>
        </div>
      </div>

      <hr className="border-stone-800 mb-6" />

      {/* 빌드 설명 */}
      {build.descriptionKo && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-stone-100">빌드 설명</h2>
          <div className="rounded-xl border border-stone-800 bg-stone-900/50 px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-300">
              {build.descriptionKo}
            </p>
          </div>
        </section>
      )}

      {/* 댓글 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-stone-100">
          댓글
          <span className="ml-2 text-sm font-normal text-stone-500">({build._count.comments})</span>
        </h2>
        <CommentSection
          buildId={build.id}
          initialComments={build.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt.toISOString(),
            user: c.user,
          }))}
        />
      </section>
    </div>
  )
}
