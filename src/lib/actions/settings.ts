'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData): Promise<void> {
  const adminClient = createAdminClient()
  const supabase = await createClient()

  const whatsapp = formData.get('whatsapp') as string
  const facebook = formData.get('facebook') as string
  const instagram = formData.get('instagram') as string
  const tiktok = formData.get('tiktok') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const shipping_cost = parseFloat(formData.get('shipping_cost') as string) || 2000
  const free_shipping_from = parseFloat(formData.get('free_shipping_from') as string) || 25000

  // Handle logo upload
  let logo_url: string | undefined
  const logoFile = formData.get('logo') as File
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop()
    const path = `logo-${Date.now()}.${ext}`
    const { data: upload } = await supabase.storage.from('brand').upload(path, logoFile, { upsert: true })
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(upload.path)
      logo_url = publicUrl
    }
  }

  // Handle favicon upload
  let favicon_url: string | undefined
  const faviconFile = formData.get('favicon') as File
  if (faviconFile && faviconFile.size > 0) {
    const ext = faviconFile.name.split('.').pop()
    const path = `favicon-${Date.now()}.${ext}`
    const { data: upload } = await supabase.storage.from('brand').upload(path, faviconFile, { upsert: true })
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('brand').getPublicUrl(upload.path)
      favicon_url = publicUrl
    }
  }

  const updateData: Record<string, unknown> = {
    whatsapp, facebook, instagram, tiktok,
    address, email, phone,
    shipping_cost, free_shipping_from,
    updated_at: new Date().toISOString(),
  }

  if (logo_url) updateData.logo_url = logo_url
  if (favicon_url) updateData.favicon_url = favicon_url

  const { data: existing } = await adminClient.from('site_settings').select('id').limit(1).single()
  if (existing) {
    await adminClient.from('site_settings').update(updateData).eq('id', existing.id)
  }

  revalidatePath('/admin/parametres')
}

export async function getSettings() {
  const adminClient = createAdminClient()
  const { data } = await adminClient.from('site_settings').select('*').single()
  return data
}
