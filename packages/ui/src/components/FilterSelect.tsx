'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type Option = { value: string; label: string }

type Props = {
  label: string
  options: Option[]
  paramKey: string
}

export function FilterSelect({ label, options, paramKey }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = searchParams.get(paramKey) ?? ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set(paramKey, e.target.value)
    } else {
      params.delete(paramKey)
    }
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-stone-500 whitespace-nowrap">{label}</label>
      <select
        value={current}
        onChange={handleChange}
        className={`rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm
                    text-stone-300 outline-none focus:border-crimson-600
                    ${isPending ? 'opacity-70' : ''}`}
      >
        <option value="">전체</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
