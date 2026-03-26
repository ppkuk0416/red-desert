import { RARITY_KO, RARITY_VARIANT, RARITY_BORDER, CATEGORY_ICON } from '@red-desert/ui/item/card'
import { Badge } from '@red-desert/ui/components/Badge'
import Link from 'next/link'
import type { ItemRarity } from '@red-desert/db'

type Usage = {
  quantity: number
  recipe: {
    id: string
    outputQty: number
    craftStation: string | null
    outputItem: {
      id: string
      slug: string
      nameKo: string
      nameEn: string
      rarity: ItemRarity
      iconUrl: string | null
    }
  }
}

type Props = { usages: Usage[]; locale: string }

export function UsedInSection({ usages, locale }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {usages.map((usage) => {
        const out = usage.recipe.outputItem
        const outName = locale === 'ko' ? out.nameKo : out.nameEn
        return (
          <Link
            key={usage.recipe.id}
            href={`/${locale}/item/${out.slug}`}
            className={`group rounded-xl border bg-stone-900 p-4 text-center
                        hover:bg-stone-800 transition-all ${RARITY_BORDER[out.rarity]}`}
          >
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center
                            rounded-xl bg-stone-800 text-2xl">
              {out.iconUrl ? (
                <img src={out.iconUrl} alt={outName} className="h-full w-full rounded-xl object-cover" />
              ) : (
                '⚒️'
              )}
            </div>
            <p className="text-sm font-medium text-stone-300 group-hover:text-crimson-400
                          transition-colors line-clamp-2 leading-tight">
              {outName}
            </p>
            <div className="mt-1.5 flex justify-center gap-1">
              <Badge variant={RARITY_VARIANT[out.rarity]} className="text-xs">
                {RARITY_KO[out.rarity]}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-stone-600">
              재료 × {usage.quantity}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
