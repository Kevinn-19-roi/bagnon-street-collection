import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isDirectVideoUrl } from '@/lib/media/video'
import type { GalleryItem, VideoItem } from '@/types/database'

export const getActiveGalleryItems = unstable_cache(async (): Promise<GalleryItem[]> => {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('gallery_items')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(8)

    return (data || []) as GalleryItem[]
  } catch {
    return []
  }
}, ['active-gallery-items'], { revalidate: 300, tags: ['home-media'] })

export const getActiveVideoItems = unstable_cache(async (): Promise<VideoItem[]> => {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('video_items')
      .select('*')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6)

    return ((data || []) as VideoItem[]).filter(item => isDirectVideoUrl(item.video_url)).slice(0, 6)
  } catch {
    return []
  }
}, ['active-video-items'], { revalidate: 300, tags: ['home-media'] })

export async function getGalleryItemsAdmin(): Promise<GalleryItem[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    if (error.message.includes('gallery_items')) return []
    throw new Error(error.message)
  }

  return (data || []) as GalleryItem[]
}

export async function getVideoItemsAdmin(): Promise<VideoItem[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('video_items')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    if (error.message.includes('video_items')) return []
    throw new Error(error.message)
  }

  return (data || []) as VideoItem[]
}
