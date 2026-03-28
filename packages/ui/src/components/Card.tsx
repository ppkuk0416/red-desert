import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-stone-800 bg-stone-900 p-5
                  hover:border-stone-700 transition-colors ${className}`}
    >
      {children}
    </div>
  )
}
