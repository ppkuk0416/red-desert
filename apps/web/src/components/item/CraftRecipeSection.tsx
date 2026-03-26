import { RARITY_KO, RARITY_VARIANT } from '@red-desert/ui/item/card'
import { Badge } from '@red-desert/ui/components/Badge'
import Link from 'next/link'
import type { ItemRarity } from '@red-desert/db'

type Ingredient = {
  quantity: number
  item: {
    id: string
    slug: string
    nameKo: string
    nameEn: string
    rarity: ItemRarity
    iconUrl: string | null
  }
}

type Recipe = {
  id: string
  outputQty: number
  craftStation: string | null
  notes: string | null
  ingredients: Ingredient[]
}

type Props = { recipes: Recipe[]; locale: string }

export function CraftRecipeSection({ recipes, locale }: Props) {
  return (
    <div className="space-y-4">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
          {recipe.craftStation && (
            <div className="mb-3 flex items-center gap-2 text-sm text-stone-400">
              <span>⚒️</span>
              <span>{recipe.craftStation}</span>
              {recipe.outputQty > 1 && (
                <Badge variant="default">× {recipe.outputQty}</Badge>
              )}
            </div>
          )}

          {/* 재료 목록 */}
          <div className="flex flex-wrap gap-3">
            {recipe.ingredients.map((ing, i) => {
              const ingName = locale === 'ko' ? ing.item.nameKo : ing.item.nameEn
              return (
                <Link
                  key={ing.item.id}
                  href={`/${locale}/item/${ing.item.slug}`}
                  className="group flex items-center gap-2 rounded-lg border border-stone-700
                             bg-stone-800 px-3 py-2 hover:border-crimson-700 transition-colors"
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-stone-700
                                  flex items-center justify-center text-base">
                    {ing.item.iconUrl ? (
                      <img src={ing.item.iconUrl} alt={ingName} className="h-full w-full object-cover" />
                    ) : (
                      '🪨'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-300 group-hover:text-crimson-400 transition-colors">
                      {ingName}
                    </p>
                    <p className="text-xs text-stone-500">
                      × {ing.quantity}
                      <Badge variant={RARITY_VARIANT[ing.item.rarity]} className="text-xs">
                        {RARITY_KO[ing.item.rarity]}
                      </Badge>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {recipe.notes && (
            <p className="mt-3 text-xs text-stone-600">{recipe.notes}</p>
          )}
        </div>
      ))}
    </div>
  )
}
