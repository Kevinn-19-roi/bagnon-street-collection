import { createAdminClient } from '@/lib/supabase/admin'
import type { Category, Collection } from '@/types/database'

export async function getCategories(): Promise<Category[]> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  return (data as Category[]) || []
}

export async function getCollections(): Promise<Collection[]> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('collections')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return (data as Collection[]) || []
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
  return (data as Category[]) || []
}

export async function createCategory(data: Partial<Category>) {
  const adminClient = createAdminClient()
  const { data: result, error } = await adminClient
    .from('categories')
    .insert(data)
    .select()
    .single()
  return { data: result, error: error?.message || null }
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const adminClient = createAdminClient()
  const { data: result, error } = await adminClient
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  return { data: result, error: error?.message || null }
}

export async function deleteCategory(id: string) {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categories').delete().eq('id', id)
  return { error: error?.message || null }
}
