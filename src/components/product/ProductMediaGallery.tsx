import Image from 'next/image'

type ProductMediaGalleryProps = {
  images: string[]
  productName: string
}

export default function ProductMediaGallery({ images, productName }: ProductMediaGalleryProps) {
  const galleryImages = images.length > 0 ? images : ['/brand/logo-globe.jpg']

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <Image
          src={galleryImages[0]}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {galleryImages.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {galleryImages.slice(0, 4).map((image, index) => (
            <div key={`${image}-${index}`} style={{ position: 'relative', aspectRatio: '1 / 1', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg2)' }}>
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                sizes="120px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
