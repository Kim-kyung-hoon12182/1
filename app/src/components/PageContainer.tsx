import type { ReactNode } from 'react'

export default function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 animate-page-in px-4 py-6 pb-16 sm:px-8">{children}</main>
  )
}
