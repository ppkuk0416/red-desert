import { ItemCard, type ItemCardData } from '@red-desert/ui/item/card'

type Props = {
  items: ItemCardData[]
  locale: string
}

export function ItemGrid({ items, locale }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  )
}
