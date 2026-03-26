type Props = {
  value: number // 1-5
  max?: number
}

export function DifficultyStars({ value, max = 5 }: Props) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`난이도 ${value}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? 'text-crimson-500' : 'text-stone-700'}>
          ★
        </span>
      ))}
    </span>
  )
}
