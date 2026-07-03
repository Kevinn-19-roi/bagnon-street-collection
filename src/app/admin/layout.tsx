import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin — BSC', template: '%s | Admin BSC' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
