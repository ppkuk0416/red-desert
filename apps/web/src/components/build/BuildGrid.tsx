import { BuildCard } from '@red-desert/ui/build/card'
import type { BuildCardData } from '@red-desert/ui/build/card'

type Props = {
  builds: BuildCardData[]
  locale: string
}

export function BuildGrid({ builds, locale }: Props) {
  if (builds.length === 0) {
    return (
      <div className="py-20 text-center text-stone-600">
        조건에 맞는 빌드가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {builds.map((build) => (
        <BuildCard key={build.id} build={build} locale={locale} />
      ))}
    </div>
  )
}
