import type { ReactNode } from 'react'

type Variant = 'default' | 'crimson' | 'sand' | 'success' | 'warning'

const variantClass: Record<Variant, string> = {
  default: 'bg-stone-800 text-stone-300',
  crimson: 'bg-crimson-900/60 text-crimson-300 border border-crimson-800',
  sand: 'bg-sand-900/60 text-sand-300 border border-sand-800',
  success: 'bg-green-900/60 text-green-300',
  warning: 'bg-yellow-900/60 text-yellow-300',
}

type Props = {
  children: ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${variantClass[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
