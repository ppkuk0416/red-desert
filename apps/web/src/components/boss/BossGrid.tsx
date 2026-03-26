import { BossCard, type BossCardData } from '@red-desert/ui/boss/card'

type Props = {
  bosses: BossCardData[]
  locale: string
}

export function BossGrid({ bosses, locale }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {bosses.map((boss) => (
        <BossCard key={boss.id} boss={boss} locale={locale} />
      ))}
    </div>
  )
}
