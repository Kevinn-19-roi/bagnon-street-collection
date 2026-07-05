import { getCurrentAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Admin } from '@/types/database'

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0F12', fontFamily: 'var(--font-display)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar admin={admin as Admin} />
        <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
