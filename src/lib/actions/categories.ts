'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { generateSlug } from '@/lib/helpers/slugify'

export async function createCategory(formData: FormData): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string || generateSlug(name)
  const description = formData.get('description') as string
  const active = formData.get('active') === 'true'
  const display_order = parseInt(formData.get('display_order') as string) || 0

  const { error } = await adminClient.from('categories').insert({ name, slug, description, active, display_order })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const active = formData.get('active') === 'true'
  const display_order = parseInt(formData.get('display_order') as string) || 0

  const { error } = await adminClient.from('categories').update({ name, slug, description, active, display_order }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function createCollection(formData: FormData): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string || generateSlug(name)
  const description = formData.get('description') as string
  const active = formData.get('active') === 'true'

  const { error } = await adminClient.from('collections').insert({ name, slug, description, active })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/collections')
  redirect('/admin/collections')
}

export async function updateCollection(id: string, formData: FormData): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const active = formData.get('active') === 'true'

  const { error } = await adminClient.from('collections').update({ name, slug, description, active }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/collections')
  redirect('/admin/collections')
}

export async function deleteCollection(id: string): Promise<void> {
  await requireAdmin()

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('collections').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/collections')
  redirect('/admin/collections')
}
