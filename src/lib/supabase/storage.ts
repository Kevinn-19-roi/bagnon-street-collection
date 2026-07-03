'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type StorageBucket = 'products' | 'categories' | 'banners' | 'brand'

// ─── UPLOAD IMAGE ────────────────────────────────────────────

export async function uploadImage(
  file: File,
  bucket: StorageBucket,
  path?: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  const ext = file.name.split('.').pop()
  const filename = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) return { url: null, error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, error: null }
}

// ─── DELETE IMAGE ────────────────────────────────────────────

export async function deleteImage(
  bucket: StorageBucket,
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  return { error: error?.message || null }
}

// ─── GET PUBLIC URL ──────────────────────────────────────────

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// ─── LIST FILES IN BUCKET ────────────────────────────────────

export async function listBucketFiles(bucket: StorageBucket, folder?: string) {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.storage
    .from(bucket)
    .list(folder || '', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  return { data, error }
}
