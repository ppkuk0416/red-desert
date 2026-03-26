'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SearchModal } from './SearchModal'

type SearchCtx = { open: () => void }
const SearchContext = createContext<SearchCtx>({ open: () => {} })

export function useSearch() {
  return useContext(SearchContext)
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  // Cmd+K / Ctrl+K 전역 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <SearchContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <SearchModal open={isOpen} onClose={() => setIsOpen(false)} />
    </SearchContext.Provider>
  )
}
