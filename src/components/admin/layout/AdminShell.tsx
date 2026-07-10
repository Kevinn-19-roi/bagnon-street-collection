import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Admin } from '@/types/database'

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  // Get current user session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Get admin data using service role (bypass RLS)
  const adminClient = createAdminClient()
  const { data: admin } = await adminClient
    .from('admins')
    .select('id, fullname, email, role, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (!admin) redirect('/admin/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0F12', fontFamily: 'var(--font-display)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar admin={admin as Admin} />
        <main style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px, 3vw, 28px)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
