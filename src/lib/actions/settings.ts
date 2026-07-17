'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/actions/auth'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateSettings(formData: FormData): Promise<void> {
  await requireAdmin()

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

  const { data: existing } = await adminClient.from('site_settings').select('*').limit(1).single()
  const supportsHeroSettings = Boolean(existing && 'hero_image_url' in existing)

  const hero_eyebrow = formData.get('hero_eyebrow') as string
  const hero_title = formData.get('hero_title') as string
  const hero_title_accent = formData.get('hero_title_accent') as string
  const hero_description = formData.get('hero_description') as string
  const hero_button_text = formData.get('hero_button_text') as string
  const hero_button_link = formData.get('hero_button_link') as string
  const hero_video_url_input = String(formData.get('hero_video_url') || '').trim()
  const hero_media_type = String(formData.get('hero_media_type') || 'image') === 'video' ? 'video' : 'image'
  const hero_media_position = String(formData.get('hero_media_position') || 'center').trim() || 'center'
  const hero_overlay_opacity = Math.min(0.75, Math.max(0.15, Number(formData.get('hero_overlay_opacity') || 0.42)))
  const brand_quote = formData.get('brand_quote') as string
  const brand_quote_author = formData.get('brand_quote_author') as string

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

  let hero_image_url: string | undefined
  const heroFile = formData.get('hero_image') as File
  if (supportsHeroSettings && heroFile && heroFile.size > 0) {
    const ext = heroFile.name.split('.').pop()
    const path = `home-hero-${Date.now()}.${ext}`
    const { data: upload } = await supabase.storage.from('banners').upload(path, heroFile, { upsert: true })
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(upload.path)
      hero_image_url = publicUrl
    }
  }

  let hero_video_url: string | undefined
  const heroVideoFile = formData.get('hero_video') as File
  if (supportsHeroSettings && heroVideoFile && heroVideoFile.size > 0) {
    const ext = heroVideoFile.name.split('.').pop()
    const path = `hero/home-hero-video-${Date.now()}.${ext}`
    const { data: upload } = await supabase.storage.from('banners').upload(path, heroVideoFile, { upsert: true })
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(upload.path)
      hero_video_url = publicUrl
    }
  }

  const updateData: Record<string, unknown> = {
    whatsapp, facebook, instagram, tiktok,
    address, email, phone,
    shipping_cost, free_shipping_from,
    updated_at: new Date().toISOString(),
  }

  if (supportsHeroSettings) {
    updateData.hero_eyebrow = hero_eyebrow
    updateData.hero_title = hero_title
    updateData.hero_title_accent = hero_title_accent
    updateData.hero_description = hero_description
    updateData.hero_button_text = hero_button_text
    updateData.hero_button_link = hero_button_link
    if ('hero_media_type' in existing) updateData.hero_media_type = hero_media_type
    if ('hero_media_position' in existing) updateData.hero_media_position = hero_media_position
    if ('hero_overlay_opacity' in existing) updateData.hero_overlay_opacity = hero_overlay_opacity
    if ('hero_video_url' in existing) updateData.hero_video_url = hero_video_url || hero_video_url_input || null
    if ('brand_quote' in existing) updateData.brand_quote = brand_quote
    if ('brand_quote_author' in existing) updateData.brand_quote_author = brand_quote_author
  }

  if (logo_url) updateData.logo_url = logo_url
  if (favicon_url) updateData.favicon_url = favicon_url
  if (hero_image_url) updateData.hero_image_url = hero_image_url

  if (existing) {
    const { error } = await adminClient.from('site_settings').update(updateData).eq('id', existing.id)
    if (error) {
      throw new Error(error.message)
    }
  }

  revalidatePath('/admin/parametres')
  revalidatePath('/')
  revalidateTag('site-settings')
}

export async function getSettings() {
  await requireAdmin()

  const adminClient = createAdminClient()
  const { data } = await adminClient.from('site_settings').select('*').single()
  return data
}
