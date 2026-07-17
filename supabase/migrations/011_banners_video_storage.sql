-- Sprint 10.2 - Allow admin-managed videos in the existing public banners bucket.
-- Non-destructive: keeps existing files and only widens accepted media types/size.

UPDATE storage.buckets
SET
  file_size_limit = GREATEST(COALESCE(file_size_limit, 0), 52428800),
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
WHERE id = 'banners';
