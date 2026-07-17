'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/actions/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function mediaMissing(message?: string) {
  return Boolean(message && (
    message.includes('gallery_items') ||
    message.includes('video_items') ||
    message.includes('schema cache')
  ))
}

function cleanOptional(value: FormDataEntryValue | null) {
  const text = String(value || '').trim()
  return text || null
}

async function uploadBannerFile(file: File | null, folder: string) {
  if (!file || file.size === 0) return null

  const supabase = await createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from('banners')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(data.path)
  return publicUrl
}

function refreshMedia(path: string) {
  revalidatePath(path)
  revalidatePath('/')
  revalidateTag('home-media')
}

export async function createGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  let uploadedUrl: string | null = null

  try {
    uploadedUrl = await uploadBannerFile(formData.get('image_file') as File | null, 'gallery')
  } catch (error) {
    if (error instanceof Error && mediaMissing(error.message)) redirect('/admin/galerie?error=migration-missing')
    redirect('/admin/galerie?error=save')
  }

  const imageUrl = uploadedUrl || cleanOptional(formData.get('image_url'))
  if (!imageUrl) redirect('/admin/galerie?error=image-required')

  try {
    const { error } = await adminClient.from('gallery_items').insert({
      image_url: imageUrl,
      caption: cleanOptional(formData.get('caption')),
      display_order: Number(formData.get('display_order') || 0),
      active: formData.get('active') === 'on',
    })

    if (error) {
      if (mediaMissing(error.message)) redirect('/admin/galerie?error=migration-missing')
      redirect('/admin/galerie?error=save')
    }
  } catch (error) {
    if (error instanceof Error && mediaMissing(error.message)) redirect('/admin/galerie?error=migration-missing')
    redirect('/admin/galerie?error=save')
  }

  refreshMedia('/admin/galerie')
  redirect('/admin/galerie?success=created')
}

export async function updateGalleryItem(id: string, formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  let uploadedUrl: string | null = null

  try {
    uploadedUrl = await uploadBannerFile(formData.get('image_file') as File | null, 'gallery')
  } catch {
    redirect('/admin/galerie?error=save')
  }

  const imageUrl = uploadedUrl || cleanOptional(formData.get('image_url'))
  if (!imageUrl) redirect('/admin/galerie?error=image-required')

  try {
    const { error } = await adminClient.from('gallery_items').update({
      image_url: imageUrl,
      caption: cleanOptional(formData.get('caption')),
      display_order: Number(formData.get('display_order') || 0),
      active: formData.get('active') === 'on',
    }).eq('id', id)

    if (error) redirect('/admin/galerie?error=save')
  } catch {
    redirect('/admin/galerie?error=save')
  }

  refreshMedia('/admin/galerie')
  redirect('/admin/galerie?success=updated')
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('gallery_items').delete().eq('id', id)
  if (error) redirect('/admin/galerie?error=delete')

  refreshMedia('/admin/galerie')
  redirect('/admin/galerie?success=deleted')
}

async function hasVideoCapacity(adminClient: ReturnType<typeof createAdminClient>, id?: string) {
  let query = adminClient
    .from('video_items')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)

  if (id) query = query.neq('id', id)

  const { count, error } = await query
  if (error) throw new Error(error.message)
  return (count || 0) < 6
}

export async function createVideoItem(formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const active = formData.get('active') === 'on'
  let canActivate = true
  let uploadedPoster: string | null = null

  try {
    if (active) canActivate = await hasVideoCapacity(adminClient)
    uploadedPoster = await uploadBannerFile(formData.get('poster_file') as File | null, 'videos')
  } catch (error) {
    if (error instanceof Error && mediaMissing(error.message)) redirect('/admin/videos?error=migration-missing')
    redirect('/admin/videos?error=save')
  }

  if (!canActivate) redirect('/admin/videos?error=active-limit')

  const posterUrl = uploadedPoster || cleanOptional(formData.get('poster_url'))
  const videoUrl = cleanOptional(formData.get('video_url'))
  if (!videoUrl || !posterUrl) redirect('/admin/videos?error=video-required')

  try {
    const { error } = await adminClient.from('video_items').insert({
      title: cleanOptional(formData.get('title')),
      caption: cleanOptional(formData.get('caption')),
      video_url: videoUrl,
      poster_url: posterUrl,
      display_order: Number(formData.get('display_order') || 0),
      active,
      featured: formData.get('featured') === 'on',
    })

    if (error) {
      if (mediaMissing(error.message)) redirect('/admin/videos?error=migration-missing')
      redirect('/admin/videos?error=save')
    }
  } catch (error) {
    if (error instanceof Error && mediaMissing(error.message)) redirect('/admin/videos?error=migration-missing')
    redirect('/admin/videos?error=save')
  }

  refreshMedia('/admin/videos')
  redirect('/admin/videos?success=created')
}

export async function updateVideoItem(id: string, formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const active = formData.get('active') === 'on'
  let canActivate = true
  let uploadedPoster: string | null = null

  try {
    if (active) canActivate = await hasVideoCapacity(adminClient, id)
    uploadedPoster = await uploadBannerFile(formData.get('poster_file') as File | null, 'videos')
  } catch {
    redirect('/admin/videos?error=save')
  }

  if (!canActivate) redirect('/admin/videos?error=active-limit')

  const posterUrl = uploadedPoster || cleanOptional(formData.get('poster_url'))
  const videoUrl = cleanOptional(formData.get('video_url'))
  if (!videoUrl || !posterUrl) redirect('/admin/videos?error=video-required')

  try {
    const { error } = await adminClient.from('video_items').update({
      title: cleanOptional(formData.get('title')),
      caption: cleanOptional(formData.get('caption')),
      video_url: videoUrl,
      poster_url: posterUrl,
      display_order: Number(formData.get('display_order') || 0),
      active,
      featured: formData.get('featured') === 'on',
    }).eq('id', id)

    if (error) redirect('/admin/videos?error=save')
  } catch {
    redirect('/admin/videos?error=save')
  }

  refreshMedia('/admin/videos')
  redirect('/admin/videos?success=updated')
}

export async function deleteVideoItem(id: string): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('video_items').delete().eq('id', id)
  if (error) redirect('/admin/videos?error=delete')

  refreshMedia('/admin/videos')
  redirect('/admin/videos?success=deleted')
}
