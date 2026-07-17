'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Collection, Product } from '@/types/database'
import { generateSlug, generateSKU } from '@/lib/helpers/slugify'
import Button from '@/components/admin/ui/Button'
import type { ProductActionResult } from '@/lib/actions/products'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Taille unique']

const COLOR_OPTIONS = [
  { name: 'Noir', hex: '#111111' },
  { name: 'Blanc', hex: '#F5F3EE' },
  { name: 'Kaki', hex: '#5B6042' },
  { name: 'Rouge', hex: '#7A1620' },
  { name: 'Bleu', hex: '#1A2A6C' },
  { name: 'Gris', hex: '#737373' },
  { name: 'Beige', hex: '#C8B89A' },
  { name: 'Marron', hex: '#5C4033' },
]

interface Props {
  categories: Category[]
  collections: Collection[]
  product?: Partial<Product>
  onSubmit: (data: FormData) => Promise<ProductActionResult>
  isEdit?: boolean
}

export default function ProductForm({ categories, collections, product, onSubmit, isEdit }: Props) {
  const router = useRouter()
  const [name, setName] = useState(product?.name || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [oldPrice, setOldPrice] = useState(product?.old_price?.toString() || '')
  const [stock, setStock] = useState(product?.stock?.toString() || '0')
  const [categoryId, setCategoryId] = useState(product?.category_id || '')
  const [collectionId, setCollectionId] = useState(product?.collection_id || '')
  const [description, setDescription] = useState(product?.description || '')
  const [shortDesc, setShortDesc] = useState(product?.short_description || '')
  const [material, setMaterial] = useState(product?.material || '')
  const [care, setCare] = useState(product?.care_instructions || '')
  const [featured, setFeatured] = useState(product?.featured || false)
  const [newArrival, setNewArrival] = useState(product?.new_arrival || false)
  const [onSale, setOnSale] = useState(product?.on_sale || false)
  const [active, setActive] = useState(product?.active ?? true)
  const [selectedSizes, setSelectedSizes] = useState(() => new Set((product?.sizes || []).map(size => size.size)))
  const [selectedColors, setSelectedColors] = useState(() => new Set((product?.colors || []).map(color => color.color_name)))
  const [loading, setLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const colorOptions = [
    ...COLOR_OPTIONS,
    ...(product?.colors || [])
      .filter(color => !COLOR_OPTIONS.some(option => option.name === color.color_name))
      .map(color => ({ name: color.color_name, hex: color.color_hex })),
  ]

  function handleNameChange(val: string) {
    setName(val)
    if (!isEdit) {
      setSlug(generateSlug(val))
      if (categoryId) {
        const cat = categories.find(c => c.id === categoryId)
        setSku(generateSKU(val, cat?.name || 'PRD'))
      }
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImageFiles(files)
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(previews)
  }

  function generateDescription() {
    const category = categories.find(c => c.id === categoryId)?.name || 'piece'
    const categoryLabel = category.toLowerCase() === 'hoodies' ? 'sweat' : category.toLowerCase()
    const colorText = selectedColors.size ? ` ${[...selectedColors].join(', ').toLowerCase()}` : ''
    const materialText = material.trim() ? ` en ${material.trim()}` : ''
    const sizeText = selectedSizes.size ? ` Disponible en ${[...selectedSizes].join(', ')}.` : ''
    const baseName = name.trim() || 'Cette piece'

    setDescription(`${baseName}, ${categoryLabel}${colorText}${materialText}, pense pour un style moderne, confortable et facile a porter.${sizeText}`)
    if (!shortDesc.trim()) {
      setShortDesc(`${baseName} au style Bagnon Street, simple et efficace.`)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setFormMessage(null)

    try {
      const maxFileSize = 5 * 1024 * 1024
      const maxTotalSize = 24 * 1024 * 1024
      const tooLarge = imageFiles.find(file => file.size > maxFileSize)
      const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0)

      if (tooLarge) {
        setFormMessage({ type: 'error', text: `L'image "${tooLarge.name}" depasse 5 Mo.` })
        setLoading(false)
        return
      }

      if (totalSize > maxTotalSize) {
        setFormMessage({ type: 'error', text: 'Le total des images est trop lourd. Ajoute moins d images en une seule fois.' })
        setLoading(false)
        return
      }

      const formData = new FormData(e.currentTarget)
      formData.set('featured', featured.toString())
      formData.set('new_arrival', newArrival.toString())
      formData.set('on_sale', onSale.toString())
      formData.set('active', active.toString())
      formData.delete('images')
      imageFiles.forEach(f => formData.append('images', f))

      const result = await onSubmit(formData)
      setFormMessage({
        type: result.success ? 'success' : 'error',
        text: result.success
          ? `${result.message} Si le produit n'apparait pas dans une section publique, verifie qu'il est actif, en stock, marque Nouveaute/Vedette, avec une image, et qu'il n'est pas hors limite d'affichage.`
          : result.message,
      })

      if (result.success) {
        router.refresh()
        router.push(result.redirectTo || '/admin/produits')
      }
    } catch (error) {
      setFormMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Une erreur est survenue pendant l'enregistrement.",
      })
    } finally {
      setLoading(false)
    }
  }

  function toggleSetValue(current: Set<string>, value: string) {
    const next = new Set(current)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const inputStyle = {
    width: '100%', background: '#0A0A0C',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
    padding: '10px 14px', color: '#F2F1ED', fontSize: 13,
    outline: 'none', fontFamily: 'var(--font-display)',
  }

  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-display)', fontSize: 10,
    fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' as const,
    color: '#94938E', marginBottom: 6,
  }

  const groupStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6 }

  const sectionStyle = {
    background: '#17171B', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6, padding: 24, marginBottom: 16,
  }

  const sectionTitle = {
    fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
    letterSpacing: '.1em', textTransform: 'uppercase' as const,
    color: '#F2F1ED', marginBottom: 20, paddingBottom: 12,
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  }

  const checkboxRow = (label: string, checked: boolean, onChange: (v: boolean) => void, description?: string) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ marginTop: 2, accentColor: '#7A1620', width: 14, height: 14 }}
      />
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: '#F2F1ED' }}>{label}</p>
        {description && <p style={{ fontSize: 11, color: '#4D4D52', marginTop: 2 }}>{description}</p>}
      </div>
    </label>
  )

  const optionButtonStyle = (selected: boolean) => ({
    border: `1px solid ${selected ? '#7A1620' : 'rgba(255,255,255,0.1)'}`,
    background: selected ? 'rgba(122,22,32,0.22)' : '#0A0A0C',
    color: selected ? '#F2F1ED' : '#94938E',
    borderRadius: 3,
    padding: '9px 10px',
    fontFamily: 'var(--font-display)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    minHeight: 36,
  })

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        @media(max-width:980px){
          .product-form-shell,
          .product-form-grid-2,
          .product-form-grid-3{grid-template-columns:1fr!important;}
          .product-option-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
          .product-sku-row{flex-wrap:wrap!important;}
          .product-sku-row input{min-width:180px!important;}
        }
      `}</style>
      {[...selectedSizes].map(size => <input key={size} type="hidden" name="sizes" value={size} />)}
      {[...selectedColors].map(colorName => {
        const option = colorOptions.find(color => color.name === colorName)
        const existing = product?.colors?.find(color => color.color_name === colorName)
        return (
          <input
            key={colorName}
            type="hidden"
            name="colors"
            value={`${colorName}|${option?.hex || existing?.color_hex || '#111111'}`}
          />
        )
      })}
      <div className="product-form-shell" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16 }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Informations générales */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Informations générales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Nom du produit *</label>
                <input name="name" value={name} onChange={e => handleNameChange(e.target.value)} required style={inputStyle} placeholder="Ex: Hoodie BSC — Kaki" />
              </div>
              <div className="product-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Slug *</label>
                  <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} required style={inputStyle} placeholder="hoodie-bsc-kaki" />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>SKU <span style={{color:'#4D4D52',fontWeight:400,textTransform:'none',letterSpacing:0}}>(auto si vide)</span></label>
                  <div className="product-sku-row" style={{display:'flex',gap:6}}>
                    <input name="sku" value={sku} onChange={e => setSku(e.target.value)} style={{...inputStyle,flex:1}} placeholder="Généré automatiquement" />
                    <button type="button" onClick={()=>{const cat=categories.find(c=>c.id===categoryId);setSku(generateSKU(name||'PRD',cat?.name||'PRD'))}} style={{background:'rgba(26,42,108,0.2)',color:'#5C7CFA',border:'1px solid rgba(26,42,108,0.3)',borderRadius:3,padding:'0 12px',fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                      Générer
                    </button>
                  </div>
                </div>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Description courte</label>
                <input name="short_description" value={shortDesc} onChange={e => setShortDesc(e.target.value)} style={inputStyle} placeholder="Résumé en une ligne..." />
              </div>
              <div style={groupStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Description complète</label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    style={{
                      background: 'rgba(122,22,32,0.14)',
                      color: '#F2F1ED',
                      border: '1px solid rgba(122,22,32,0.32)',
                      borderRadius: 3,
                      padding: '7px 9px',
                      fontFamily: 'var(--font-display)',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Générer une description
                  </button>
                </div>
                <textarea name="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description détaillée du produit..." />
              </div>
            </div>
          </div>

          {/* Prix & Stock */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Prix & Stock</p>
            <div className="product-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Prix (FCFA) *</label>
                <input name="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required min={0} style={inputStyle} placeholder="9500" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Ancien prix (FCFA)</label>
                <input name="old_price" type="number" value={oldPrice} onChange={e => setOldPrice(e.target.value)} min={0} style={inputStyle} placeholder="12000" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Stock total *</label>
                <input name="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required min={0} style={inputStyle} placeholder="50" />
              </div>
            </div>
          </div>

          {/* Détails produit */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Détails du produit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="product-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Matière</label>
                  <input name="material" value={material} onChange={e => setMaterial(e.target.value)} style={inputStyle} placeholder="Ex: 100% Coton 380g" />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Poids (kg)</label>
                  <input name="weight" type="number" step="0.01" style={inputStyle} placeholder="0.5" />
                </div>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Instructions d'entretien</label>
                <textarea name="care_instructions" value={care} onChange={e => setCare(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Ex: Lavage à 30°C, ne pas sécher au sèche-linge..." />
              </div>
            </div>
          </div>

          {/* Variantes */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Tailles</p>
            <div className="product-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              {SIZE_OPTIONS.map(size => {
                const selected = selectedSizes.has(size)
                return (
                  <button
                    key={size}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedSizes(current => toggleSetValue(current, size))}
                    style={optionButtonStyle(selected)}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: '#4D4D52', marginTop: 10, fontFamily: 'var(--font-display)' }}>
              Facultatif. Laisse vide si le produit n'a pas de taille.
            </p>
          </div>

          <div style={sectionStyle}>
            <p style={sectionTitle}>Couleurs</p>
            <div className="product-option-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              {colorOptions.map(color => {
                const selected = selectedColors.has(color.name)
                return (
                  <button
                    key={color.name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedColors(current => toggleSetValue(current, color.name))}
                    style={{ ...optionButtonStyle(selected), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: color.hex, border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }} />
                    {color.name}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: '#4D4D52', marginTop: 10, fontFamily: 'var(--font-display)' }}>
              Facultatif. Affiche le selecteur couleur sur la fiche produit uniquement si plusieurs couleurs sont disponibles.
            </p>
          </div>

          {/* Images */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Images du produit</p>
            <div>
              <label style={{ display: 'block', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 6, padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'border-color .2s' }}>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ margin: '0 auto 12px', color: '#4D4D52' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#94938E' }}>
                  Cliquer pour sélectionner des images
                </p>
                <p style={{ fontSize: 11, color: '#4D4D52', marginTop: 4 }}>JPG, PNG, WEBP — Max 5MB par image</p>
              </label>
              {imagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {imagePreviews.map((src, i) => (
                    <div key={i} style={{ width: 80, height: 100, position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Catégorie & Collection */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Organisation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Catégorie *</label>
                <select name="category_id" value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Collection</label>
                <select name="collection_id" value={collectionId} onChange={e => setCollectionId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Aucune</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Visibilité */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Visibilité</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {checkboxRow('Actif', active, setActive, 'Visible sur le site')}
              {checkboxRow('En vedette', featured, setFeatured, 'Affiché sur la homepage')}
              {checkboxRow('Nouveauté', newArrival, setNewArrival, 'Badge "Nouveau"')}
              {checkboxRow('En promotion', onSale, setOnSale, 'Badge "Promo"')}
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {formMessage && (
              <div
                role={formMessage.type === 'error' ? 'alert' : 'status'}
                style={{
                  background: formMessage.type === 'error' ? 'rgba(239,83,80,0.12)' : 'rgba(76,175,80,0.12)',
                  border: `1px solid ${formMessage.type === 'error' ? 'rgba(239,83,80,0.32)' : 'rgba(76,175,80,0.32)'}`,
                  color: formMessage.type === 'error' ? '#EF5350' : '#81C784',
                  borderRadius: 3,
                  padding: '10px 12px',
                  fontFamily: 'var(--font-display)',
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {formMessage.text}
              </div>
            )}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
            </Button>
            <a href="/admin/produits" style={{ display: 'block', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 11, color: '#94938E', padding: '8px', textDecoration: 'none' }}>
              Annuler
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}
