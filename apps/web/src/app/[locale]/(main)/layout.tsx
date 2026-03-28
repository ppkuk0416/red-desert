'use client'

import { Header } from '@red-desert/ui/header'
import { Footer } from '@red-desert/ui/footer'
import { useSearch } from '@/components/search/SearchProvider'
import { AuthButton } from '@/components/auth/AuthButton'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { open } = useSearch()

  return (
    <div className="flex min-h-screen flex-col">
      <Header onSearchOpen={open} userSlot={<AuthButton />} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
