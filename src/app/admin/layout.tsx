import type { Metadata } from 'next'
import { getCurrentAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/layout/Sidebar'
import TopBar from '@/components/admin/layout/TopBar'
import { Admin } from '@/types/database'

export const metadata: Metadata = {
  title: { default: 'Admin — BSC', template: '%s | Admin BSC' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Login page has its own layout
  return <>{children}</>
}
