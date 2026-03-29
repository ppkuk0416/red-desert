import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getUserProfile } from '@/lib/queries/profile'
import { Badge } from '@red-desert/ui/components/Badge'

type Props = {
  params: Promise<{ locale: string; userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { userId } = await params
    const profile = await getUserProfile(userId)
    if (!profile) return {}
    return {
      title: `${profile.username} 프로필`,
      description: profile.bio ?? `${profile.username}의 빌드와 기여 이력`,
    }
  } catch {
    return {}
  }
}

const CONTRIBUTION_TYPE_KO: Record<string, string> = {
  DROP_RATE: '드랍률 제보',
  MAP_MARKER: '지도 마커',
  BOSS_TIP: '보스 공략 팁',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'crimson'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'crimson',
}

const STATUS_KO: Record<string, string> = {
  APPROVED: '승인',
  PENDING: '검토중',
  REJECTED: '반려',
}

const CHARACTER_KO: Record<string, string> = {
  KLIFF: '클리프',
  DAMIANE: '다미아네',
  OONGKA: '웅카',
}

export default async function ProfilePage({ params }: Props) {
  const { locale, userId } = await params
  const profile = await getUserProfile(userId)

  if (!profile) notFound()

  const joinedDate = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(profile.createdAt)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* 프로필 헤더 */}
      <div className="mb-8 flex items-start gap-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-stone-700 flex items-center justify-center text-3xl">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-100">{profile.username}</h1>
          {profile.bio && (
            <p className="mt-1 text-sm text-stone-400">{profile.bio}</p>
          )}
          <p className="mt-1 text-xs text-stone-600">{joinedDate} 가입</p>

          {/* 통계 */}
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-stone-100">{profile._count.builds}</p>
              <p className="text-xs text-stone-500">빌드</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-stone-100">{profile._count.likes}</p>
              <p className="text-xs text-stone-500">받은 좋아요</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-stone-100">{profile._count.contributions}</p>
              <p className="text-xs text-stone-500">기여</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-stone-800 mb-8" />

      {/* 작성 빌드 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-stone-100">
          작성 빌드
          <span className="ml-2 text-sm font-normal text-stone-500">({profile._count.builds})</span>
        </h2>

        {profile.builds.length > 0 ? (
          <div className="space-y-3">
            {profile.builds.map((build) => (
              <Link
                key={build.id}
                href={`/${locale}/build/${build.slug}`}
                className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/50 px-4 py-3 hover:border-stone-700 hover:bg-stone-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-200 truncate">{build.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="default" className="text-xs">
                      {CHARACTER_KO[build.character] ?? build.character}
                    </Badge>
                    <Badge variant="sand" className="text-xs">
                      {build.weaponPrimary}
                    </Badge>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3 text-sm text-stone-500 shrink-0">
                  <span>❤️ {build._count.likes}</span>
                  <span>💬 {build._count.comments}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-stone-600 text-sm">아직 작성한 빌드가 없습니다.</p>
        )}
      </section>

      {/* 기여 이력 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-stone-100">
          기여 이력
          <span className="ml-2 text-sm font-normal text-stone-500">({profile._count.contributions})</span>
        </h2>

        {profile.contributions.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-stone-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                    유형
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
                    상태
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-500">
                    일시
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.contributions.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-stone-300">
                      {CONTRIBUTION_TYPE_KO[c.type] ?? c.type}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[c.status] ?? 'default'}>
                        {STATUS_KO[c.status] ?? c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-500 font-mono text-xs">
                      {new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                      }).format(new Date(c.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-stone-600 text-sm">아직 기여 이력이 없습니다.</p>
        )}
      </section>
    </div>
  )
}
