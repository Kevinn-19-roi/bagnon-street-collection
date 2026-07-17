'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/actions/auth'
import { isDirectVideoUrl } from '@/lib/media/video'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type VideoUploadEntry = {
  title?: string | null
  caption?: string | null
  video_url: string
  poster_url?: string | null
  display_order?: number
  active?: boolean
  featured?: boolean
}

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
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  if (!isImage && !isVideo) throw new Error('Format de fichier non accepte.')
  if (isImage && file.size > 5 * 1024 * 1024) throw new Error('Image trop lourde.')
  if (isVideo && file.size > 24 * 1024 * 1024) throw new Error('Video trop lourde.')

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

function storagePathFromBannersUrl(urlValue?: string | null) {
  if (!urlValue) return null
  try {
    const url = new URL(urlValue)
    const marker = '/storage/v1/object/public/banners/'
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    const path = decodeURIComponent(url.pathname.slice(index + marker.length))
    return path.startsWith('gallery/') || path.startsWith('videos/') || path.startsWith('hero/') ? path : null
  } catch {
    return null
  }
}

async function removeBannersFileIfSafe(urlValue?: string | null) {
  const path = storagePathFromBannersUrl(urlValue)
  if (!path) return
  const supabase = createAdminClient()
  await supabase.storage.from('banners').remove([path])
}

function refreshMedia(path: string) {
  revalidatePath(path)
  revalidatePath('/')
  revalidateTag('home-media')
  revalidateTag('site-settings')
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

export async function createGalleryItems(formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const files = (formData.getAll('image_files') as File[]).filter(file => file && file.size > 0).slice(0, 10)

  if (!files.length) redirect('/admin/galerie?error=image-required')

  const baseOrder = Number(formData.get('display_order') || 0)
  const active = formData.get('active') === 'on'
  const rows = []

  try {
    for (let index = 0; index < files.length; index++) {
      const imageUrl = await uploadBannerFile(files[index], 'gallery')
      if (!imageUrl) continue
      rows.push({
        image_url: imageUrl,
        caption: null,
        display_order: baseOrder + index,
        active,
      })
    }

    const { error } = await adminClient.from('gallery_items').insert(rows)
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
  const { data: item } = await adminClient.from('gallery_items').select('image_url').eq('id', id).maybeSingle()
  const { error } = await adminClient.from('gallery_items').delete().eq('id', id)
  if (error) redirect('/admin/galerie?error=delete')
  await removeBannersFileIfSafe(item?.image_url)

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

async function getActiveVideoCount(adminClient: ReturnType<typeof createAdminClient>) {
  const { count, error } = await adminClient
    .from('video_items')
    .select('id', { count: 'exact', head: true })
    .eq('active', true)

  if (error) throw new Error(error.message)
  return count || 0
}

export async function createVideoItemsFromUrls(entries: VideoUploadEntry[]): Promise<{ success: boolean; message: string }> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const cleanEntries = entries
    .slice(0, 6)
    .map((entry, index) => ({
      title: entry.title?.trim() || null,
      caption: entry.caption?.trim() || null,
      video_url: entry.video_url?.trim(),
      poster_url: entry.poster_url?.trim() || null,
      display_order: Number.isFinite(entry.display_order) ? Number(entry.display_order) : index + 1,
      active: Boolean(entry.active),
      featured: Boolean(entry.featured),
    }))
    .filter(entry => entry.video_url)

  if (!cleanEntries.length) return { success: false, message: 'Ajoute au moins une video.' }
  if (cleanEntries.some(entry => !isDirectVideoUrl(entry.video_url))) {
    return { success: false, message: 'Une video contient une URL incompatible.' }
  }

  try {
    const activeToAdd = cleanEntries.filter(entry => entry.active).length
    if (activeToAdd > 0) {
      const activeCount = await getActiveVideoCount(adminClient)
      if (activeCount + activeToAdd > 6) {
        return { success: false, message: "Maximum 6 videos actives sur l'accueil." }
      }
    }

    const { error } = await adminClient.from('video_items').insert(cleanEntries)
    if (error) {
      if (mediaMissing(error.message)) return { success: false, message: 'La migration video doit etre appliquee dans Supabase.' }
      return { success: false, message: error.message || 'Impossible d enregistrer les videos.' }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Impossible d enregistrer les videos.',
    }
  }

  refreshMedia('/admin/videos')
  return { success: true, message: cleanEntries.length > 1 ? 'Videos ajoutees.' : 'Video ajoutee.' }
}

export async function createVideoItem(formData: FormData): Promise<void> {
  await requireAdmin()
  const adminClient = createAdminClient()
  const active = formData.get('active') === 'on'
  let canActivate = true
  let uploadedPoster: string | null = null
  let uploadedVideo: string | null = null

  try {
    if (active) canActivate = await hasVideoCapacity(adminClient)
    uploadedPoster = await uploadBannerFile(formData.get('poster_file') as File | null, 'videos')
    uploadedVideo = await uploadBannerFile(formData.get('video_file') as File | null, 'videos')
  } catch (error) {
    if (error instanceof Error && mediaMissing(error.message)) redirect('/admin/videos?error=migration-missing')
    redirect('/admin/videos?error=save')
  }

  if (!canActivate) redirect('/admin/videos?error=active-limit')

  const posterUrl = uploadedPoster || cleanOptional(formData.get('poster_url'))
  const videoUrl = uploadedVideo || cleanOptional(formData.get('video_url'))
  if (!videoUrl) redirect('/admin/videos?error=video-required')
  if (!isDirectVideoUrl(videoUrl)) redirect('/admin/videos?error=video-url')

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
  let uploadedVideo: string | null = null

  try {
    if (active) canActivate = await hasVideoCapacity(adminClient, id)
    uploadedPoster = await uploadBannerFile(formData.get('poster_file') as File | null, 'videos')
    uploadedVideo = await uploadBannerFile(formData.get('video_file') as File | null, 'videos')
  } catch {
    redirect('/admin/videos?error=save')
  }

  if (!canActivate) redirect('/admin/videos?error=active-limit')

  const posterUrl = uploadedPoster || cleanOptional(formData.get('poster_url'))
  const videoUrl = uploadedVideo || cleanOptional(formData.get('video_url'))
  if (!videoUrl) redirect('/admin/videos?error=video-required')
  if (!isDirectVideoUrl(videoUrl)) redirect('/admin/videos?error=video-url')

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
  const { data: item } = await adminClient.from('video_items').select('video_url, poster_url').eq('id', id).maybeSingle()
  const { error } = await adminClient.from('video_items').delete().eq('id', id)
  if (error) redirect('/admin/videos?error=delete')
  await Promise.all([
    removeBannersFileIfSafe(item?.poster_url),
    removeBannersFileIfSafe(item?.video_url),
  ])

  refreshMedia('/admin/videos')
  redirect('/admin/videos?success=deleted')
}
