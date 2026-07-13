'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
})

const RegisterClientSchema = z.object({
  fullname: z.string().trim().min(2, 'Nom complet requis'),
  phone: z.string().trim().min(6, 'Téléphone requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
})

async function clearSupabaseCookies() {
  const cookieStore = await cookies()

  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name)
    }
  })
}

async function getAdminByUserId(userId: string) {
  const adminClient = createAdminClient()
  const { data: admin } = await adminClient
    .from('admins')
    .select('id, fullname, email, role, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  return admin
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const admin = await getAdminByUserId(user.id)
  if (!admin) redirect('/')

  return admin
}

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

  const admin = await getAdminByUserId(data.user.id)

  if (!admin) {
    await supabase.auth.signOut()
    await clearSupabaseCookies()
    redirect(`/admin/login?error=${encodeURIComponent('Accès non autorisé')}`)
  }

  redirect('/admin/dashboard')
}

export async function loginClient(formData: FormData): Promise<void> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    redirect(`/connexion?error=${encodeURIComponent(parsed.error.errors[0].message)}`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    redirect(`/connexion?error=${encodeURIComponent('Email ou mot de passe incorrect')}`)
  }

  const admin = await getAdminByUserId(data.user.id)
  redirect(admin ? '/admin/dashboard' : '/profil')
}

export async function registerClient(formData: FormData): Promise<void> {
  const raw = {
    fullname: formData.get('fullname') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
  }

  const parsed = RegisterClientSchema.safeParse(raw)
  if (!parsed.success) {
    redirect(`/inscription?error=${encodeURIComponent(parsed.error.errors[0].message)}`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        fullname: parsed.data.fullname,
        phone: parsed.data.phone,
        address: parsed.data.address || '',
        city: parsed.data.city || '',
      },
    },
  })

  if (error || !data.user) {
    redirect(`/inscription?error=${encodeURIComponent(error?.message || 'Création du compte impossible')}`)
  }

  const adminClient = createAdminClient()
  const { data: existingCustomer } = await adminClient
    .from('customers')
    .select('id')
    .eq('email', parsed.data.email)
    .maybeSingle()

  const customerData = {
    fullname: parsed.data.fullname,
    phone: parsed.data.phone,
    email: parsed.data.email,
    address: parsed.data.address || null,
    city: parsed.data.city || null,
  }

  if (existingCustomer) {
    await adminClient.from('customers').update(customerData).eq('id', existingCustomer.id)
  } else {
    await adminClient.from('customers').insert(customerData)
  }

  if (!data.session) {
    redirect('/connexion?message=Compte créé. Vérifie ton email si une confirmation est demandée.')
  }

  redirect('/profil')
}

export async function logoutUser(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  await clearSupabaseCookies()
  revalidatePath('/')
  revalidatePath('/profil')
  redirect('/')
}

export async function logoutAdmin(): Promise<void> {
  await logoutUser()
}

export async function getCurrentAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return getAdminByUserId(user.id)
}

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
