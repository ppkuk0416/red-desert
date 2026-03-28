import Link from 'next/link'
import { Badge } from '../components/Badge'

export type BuildCardData = {
  id: string
  slug: string
  title: string
  character: 'KLIFF' | 'DAMIANE' | 'OONGKA'
  weaponPrimary: string
  weaponSecondary: string | null
  playstyle: string
  upvotes: number
  skillCount: number
  isVerified: boolean
  descriptionKo: string | null
  descriptionEn: string | null
}

const CHARACTER_KO: Record<BuildCardData['character'], string> = {
  KLIFF: '클리프',
  DAMIANE: '다미아네',
  OONGKA: '웅카',
}

const CHARACTER_COLOR: Record<
  BuildCardData['character'],
  { accent: string; badge: string; dot: string }
> = {
  KLIFF:   { accent: 'border-crimson-700', badge: 'bg-crimson-900/40 text-crimson-400', dot: 'bg-crimson-500' },
  DAMIANE: { accent: 'border-violet-700',  badge: 'bg-violet-900/40 text-violet-400',  dot: 'bg-violet-500' },
  OONGKA:  { accent: 'border-amber-700',   badge: 'bg-amber-900/40 text-amber-400',    dot: 'bg-amber-500' },
}

const PLAYSTYLE_KO: Record<string, string> = {
  MAIN_STORY:     '메인 스토리',
  BOSS_HUNTER:    '보스 사냥',
  COMPLETIONIST:  '완전 탐색',
  EXPLORER:       '탐험가',
}

const WEAPON_KO: Record<string, string> = {
  SWORD_SHIELD: '검+방패',
  GREATSWORD:   '대검',
  SPEAR:        '창',
  DAGGER:       '단검',
  BOW:          '활',
  CROSSBOW:     '석궁',
  STAFF:        '지팡이',
  SCYTHE:       '낫',
  HAMMER:       '망치',
  FLAIL:        '도리깨',
  TWIN_SWORDS:  '쌍검',
  BARE_HANDS:   '맨손',
  SPECIAL:      '특수',
}

type Props = {
  build: BuildCardData
  locale: string
}

export function BuildCard({ build, locale }: Props) {
  const color = CHARACTER_COLOR[build.character]
  const description =
    locale === 'ko' ? build.descriptionKo : build.descriptionEn

  return (
    <div
      className={`flex flex-col rounded-xl border bg-stone-900 p-5 transition-shadow
                  hover:shadow-lg hover:shadow-black/30 ${color.accent}`}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Character dot + name */}
          <span className={`h-2 w-2 rounded-full ${color.dot} shrink-0 mt-0.5`} />
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color.badge}`}>
            {CHARACTER_KO[build.character]}
          </span>
          {/* Primary weapon */}
          <Badge variant="sand">
            {WEAPON_KO[build.weaponPrimary] ?? build.weaponPrimary}
          </Badge>
          {/* Secondary weapon */}
          {build.weaponSecondary && (
            <Badge variant="default">
              {WEAPON_KO[build.weaponSecondary] ?? build.weaponSecondary}
            </Badge>
          )}
        </div>
        {build.isVerified && (
          <span className="shrink-0 rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-500">
            ✓ 검증됨
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 font-bold text-stone-100 leading-snug">{build.title}</h3>

      {/* Playstyle + skill count */}
      <div className="mb-3 flex items-center gap-2 text-xs text-stone-500">
        <span>{PLAYSTYLE_KO[build.playstyle] ?? build.playstyle}</span>
        <span className="text-stone-700">·</span>
        <span>스킬 {build.skillCount}개</span>
      </div>

      {/* Description */}
      {description && (
        <p className="mb-4 text-xs leading-relaxed text-stone-500 line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer row */}
      <div className="mt-auto flex items-center justify-between pt-2 border-t border-stone-800">
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <span>👍</span>
          <span className="font-medium text-stone-400">{build.upvotes.toLocaleString()}</span>
          <span>추천</span>
        </div>
        <Link
          href={`/${locale}/build/${build.slug}`}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
                      ${color.accent} text-stone-300 hover:text-stone-100
                      bg-stone-800 hover:bg-stone-700`}
        >
          빌드 보기 →
        </Link>
      </div>
    </div>
  )
}

export { CHARACTER_KO, WEAPON_KO, PLAYSTYLE_KO }
