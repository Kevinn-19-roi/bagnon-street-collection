export const dynamic = 'force-dynamic'
import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import Badge from '@/components/admin/ui/Badge'
import ConfirmSubmitForm from '@/components/admin/forms/ConfirmSubmitForm'
import ResponsiveTable from '@/components/admin/ui/ResponsiveTable'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/helpers/slugify'

export const metadata = { title: 'Admins — BSC' }

async function getAdmins() {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })
  return data || []
}

async function promoteAdmin(formData: FormData): Promise<void> {
  'use server'
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Only super_admin can promote
  const { data: me } = await adminClient.from('admins').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'super_admin') return

  const targetId = formData.get('target_id') as string
  const newRole = formData.get('new_role') as string

  await adminClient.from('admins').update({ role: newRole }).eq('id', targetId)
  revalidatePath('/admin/admins')
}

async function createNewAdmin(formData: FormData): Promise<void> {
  'use server'
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: me } = await adminClient.from('admins').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'super_admin') return

  const email = formData.get('email') as string
  const fullname = formData.get('fullname') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true,
  })

  if (error || !newUser.user) return

  await adminClient.from('admins').insert({
    id: newUser.user.id, email, fullname, role,
  })

  revalidatePath('/admin/admins')
}

async function removeAdmin(formData: FormData): Promise<void> {
  'use server'
  const adminClient = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: me } = await adminClient.from('admins').select('role').eq('id', user.id).single()
  if (!me || me.role !== 'super_admin') return

  const targetId = formData.get('target_id') as string
  if (targetId === user.id) return // cannot remove yourself

  await adminClient.from('admins').delete().eq('id', targetId)
  revalidatePath('/admin/admins')
}

const roleVariants: Record<string, any> = {
  super_admin: 'error',
  admin: 'info',
  editor: 'default',
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Éditeur',
}

export default async function AdminsPage() {
  const admins = await getAdmins()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const inputStyle = {
    background: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '9px 12px', color: '#F2F1ED',
    fontSize: 13, outline: 'none', fontFamily: 'var(--font-display)', width: '100%',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-display)', fontSize: 10,
    fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' as const,
    color: '#94938E', marginBottom: 6,
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Configuration"
        title="Gestion des admins"
        subtitle={`${admins.length} administrateur${admins.length > 1 ? 's' : ''}`}
      />

      <style>{`
        @media(max-width:980px){
          .admin-split-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className="admin-split-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
        {/* Admins list */}
        <ResponsiveTable minWidth={900}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Nom', 'Email', 'Rôle', 'Ajouté le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#4D4D52' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any, i: number) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {admin.fullname?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#F2F1ED' }}>{admin.fullname}</p>
                        {admin.id === user?.id && <p style={{ fontSize: 10, color: '#7A1620', fontFamily: 'var(--font-display)' }}>← Vous</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>{admin.email}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={roleLabels[admin.role] || admin.role} variant={roleVariants[admin.role] || 'default'} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4D4D52' }}>{formatDate(admin.created_at)}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {admin.id !== user?.id && (
                      <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                        {/* Promote/demote */}
                        <form action={promoteAdmin}>
                          <input type="hidden" name="target_id" value={admin.id} />
                          <input type="hidden" name="new_role" value={admin.role === 'super_admin' ? 'admin' : 'super_admin'} />
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(26,42,108,0.2)', color: '#5C7CFA', border: '1px solid rgba(26,42,108,0.4)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }}>
                            {admin.role === 'super_admin' ? '↓ Rétrograder' : '↑ Promouvoir'}
                          </button>
                        </form>
                        {/* Remove */}
                        <ConfirmSubmitForm action={removeAdmin} message={`Supprimer ${admin.fullname} ?`}>
                          <input type="hidden" name="target_id" value={admin.id} />
                          <button type="submit" style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(122,22,32,0.15)', color: '#EF5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }}>
                            Retirer
                          </button>
                        </ConfirmSubmitForm>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Add admin form */}
        <div style={{ background: '#17171B', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: 20 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F2F1ED', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            Ajouter un admin
          </p>
          <form action={createNewAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nom complet *</label>
              <input name="fullname" required style={inputStyle} placeholder="Prénom Nom" />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input name="email" type="email" required style={inputStyle} placeholder="email@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe *</label>
              <input name="password" type="password" required minLength={8} style={inputStyle} placeholder="Min. 8 caractères" />
            </div>
            <div>
              <label style={labelStyle}>Rôle *</label>
              <select name="role" required style={{ ...inputStyle, appearance: 'none' }}>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button type="submit" style={{ background: '#1A2A6C', color: '#fff', border: 'none', borderRadius: 3, padding: '11px', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 4 }}>
              Créer l'administrateur
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  )
}
