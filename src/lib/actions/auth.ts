'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
})

// ─── LOGIN ──────────────────────────────────────────────────

export async function loginAdmin(formData: FormData): Promise<void> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    redirect(`/admin/login?error=${encodeURIComponent(parsed.error.errors[0].message)}`)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    redirect(`/admin/login?error=${encodeURIComponent('Email ou mot de passe incorrect')}`)
  }

  // Verify user is an admin
  const { data: admin } = await supabase
    .from('admins')
    .select('id, role')
    .eq('id', data.user.id)
    .single()

  if (!admin) {
    await supabase.auth.signOut()
    redirect(`/admin/login?error=${encodeURIComponent('Accès non autorisé')}`)
  }

  redirect('/admin/dashboard')
}

// ─── LOGOUT ─────────────────────────────────────────────────

export async function logoutAdmin(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// ─── GET CURRENT ADMIN ──────────────────────────────────────

export async function getCurrentAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from('admins')
    .select('id, fullname, email, role, avatar_url')
    .eq('id', user.id)
    .single()

  return admin
}

// ─── CREATE FIRST ADMIN ─────────────────────────────────────

export async function createFirstAdmin(
  email: string,
  password: string,
  fullname: string
): Promise<{ success?: boolean; error?: string }> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { error: error?.message || 'Erreur création utilisateur' }
  }

  const { error: insertError } = await adminClient
    .from('admins')
    .insert({ id: data.user.id, email, fullname, role: 'super_admin' })

  if (insertError) return { error: insertError.message }
  return { success: true }
}
