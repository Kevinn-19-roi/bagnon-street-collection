import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import { getSettings, updateSettings } from '@/lib/actions/settings'

export const metadata = { title: 'Paramètres — Admin BSC' }
export const dynamic = 'force-dynamic'

export default async function ParametresPage() {
  const settings = await getSettings()
  const heroSettingsReady = Boolean(settings && 'hero_image_url' in settings)
  const heroMediaReady = Boolean(settings && 'hero_video_url' in settings)

  const inputStyle = {
    width: '100%', background: '#0A0A0C',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '10px 14px',
    color: '#F2F1ED', fontSize: 13, outline: 'none',
    fontFamily: 'var(--font-display)',
  }

  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-display)',
    fontSize: 10, fontWeight: 700, letterSpacing: '.15em',
    textTransform: 'uppercase' as const, color: '#94938E', marginBottom: 6,
  }

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

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres du site"
        subtitle="Configuration générale de Bagnon Street Collection"
      />

      <form action={updateSettings}>
        <style>{`
          @media(max-width:900px){
            .settings-grid,
            .settings-subgrid{grid-template-columns:1fr!important;}
            .settings-submit{justify-content:stretch!important;}
            .settings-submit button{width:100%!important;}
          }
        `}</style>
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Réseaux sociaux */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Réseaux sociaux</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'whatsapp', label: 'WhatsApp (numéro)', placeholder: '+225 07 00 00 00 00', defaultValue: settings?.whatsapp },
                { name: 'instagram', label: 'Instagram (lien)', placeholder: 'https://instagram.com/bagnonstreet', defaultValue: settings?.instagram },
                { name: 'tiktok', label: 'TikTok (lien)', placeholder: 'https://tiktok.com/@bagnonstreet', defaultValue: settings?.tiktok },
                { name: 'facebook', label: 'Facebook (lien)', placeholder: 'https://facebook.com/bagnonstreet', defaultValue: settings?.facebook },
              ].map(f => (
                <div key={f.name}>
                  <label style={labelStyle}>{f.label}</label>
                  <input name={f.name} defaultValue={f.defaultValue || ''} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Contact & Adresse</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'phone', label: 'Téléphone', placeholder: '+225 07 00 00 00 00', defaultValue: settings?.phone },
                { name: 'email', label: 'Email', placeholder: 'contact@bagnonstreet.com', defaultValue: settings?.email },
              ].map(f => (
                <div key={f.name}>
                  <label style={labelStyle}>{f.label}</label>
                  <input name={f.name} defaultValue={f.defaultValue || ''} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Adresse</label>
                <textarea name="address" defaultValue={settings?.address || ''} rows={3} placeholder="Abidjan, Côte d'Ivoire" style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          </div>

          {/* Livraison */}
          <div style={sectionStyle}>
            <p style={sectionTitle}>Livraison</p>
            <div className="settings-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Frais de livraison (FCFA)</label>
                <input name="shipping_cost" type="number" defaultValue={settings?.shipping_cost || 2000} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Livraison gratuite à partir de (FCFA)</label>
                <input name="free_shipping_from" type="number" defaultValue={settings?.free_shipping_from || 25000} style={inputStyle} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#4D4D52', marginTop: 10, fontFamily: 'var(--font-display)' }}>
              * Si le panier dépasse le seuil, la livraison sera automatiquement gratuite
            </p>
          </div>

          {/* Médias */}
          {heroSettingsReady ? (
            <div style={sectionStyle}>
              <p style={sectionTitle}>Banniere principale</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {heroMediaReady && (
                  <>
                    <div className="settings-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Media du hero</label>
                        <select name="hero_media_type" defaultValue={settings?.hero_media_type || 'image'} style={{ ...inputStyle, appearance: 'none' }}>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Cadrage</label>
                        <select name="hero_media_position" defaultValue={settings?.hero_media_position || 'center'} style={{ ...inputStyle, appearance: 'none' }}>
                          <option value="center">Centre</option>
                          <option value="top">Haut</option>
                          <option value="bottom">Bas</option>
                          <option value="left">Gauche</option>
                          <option value="right">Droite</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Intensite overlay</label>
                      <input name="hero_overlay_opacity" type="number" min="0.15" max="0.75" step="0.05" defaultValue={settings?.hero_overlay_opacity || 0.42} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Video hero optionnelle</label>
                      {settings?.hero_video_url && <p style={{ fontSize: 10, color: '#94938E', marginBottom: 6, fontFamily: 'var(--font-display)', wordBreak: 'break-all' }}>Video actuelle : {settings.hero_video_url}</p>}
                      <input name="hero_video" type="file" accept="video/mp4,video/webm,video/ogg" style={{ ...inputStyle, padding: '8px' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Ou URL video directe</label>
                      <input name="hero_video_url" defaultValue={settings?.hero_video_url || ''} placeholder="https://.../video.mp4" style={inputStyle} />
                    </div>
                  </>
                )}
                <div>
                  <label style={labelStyle}>Image principale</label>
                  {settings?.hero_image_url && (
                    <div style={{ marginBottom: 10 }}>
                      <img src={settings.hero_image_url} alt="Banniere actuelle" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }} />
                      <p style={{ fontSize: 10, color: '#4D4D52', marginTop: 4, fontFamily: 'var(--font-display)' }}>Image actuelle</p>
                    </div>
                  )}
                  <input name="hero_image" type="file" accept="image/*" style={{ ...inputStyle, padding: '8px' }} />
                </div>
                <div>
                  <label style={labelStyle}>Sous-titre court</label>
                  <input name="hero_eyebrow" defaultValue={settings?.hero_eyebrow || ''} placeholder="Collection 2025 - Abidjan" style={inputStyle} />
                </div>
                <div className="settings-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Titre</label>
                    <input name="hero_title" defaultValue={settings?.hero_title || ''} placeholder="Wear Your" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Titre accent</label>
                    <input name="hero_title_accent" defaultValue={settings?.hero_title_accent || ''} placeholder="Identity." style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Texte descriptif</label>
                  <textarea name="hero_description" defaultValue={settings?.hero_description || ''} rows={3} placeholder="Texte affiche sous le titre..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="settings-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Texte du bouton</label>
                    <input name="hero_button_text" defaultValue={settings?.hero_button_text || ''} placeholder="Explorer la collection" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Lien du bouton</label>
                    <input name="hero_button_link" defaultValue={settings?.hero_button_link || ''} placeholder="#collection" style={inputStyle} />
                  </div>
                </div>
                {heroMediaReady && (
                  <>
                    <div>
                      <label style={labelStyle}>Citation de marque</label>
                      <textarea name="brand_quote" defaultValue={settings?.brand_quote || ''} rows={4} placeholder={'On ne suit pas les tendances.\nOn construit notre propre langage.'} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Signature citation</label>
                      <input name="brand_quote_author" defaultValue={settings?.brand_quote_author || ''} placeholder="Bagnon Street Collection" style={inputStyle} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={sectionStyle}>
              <p style={sectionTitle}>Banniere principale</p>
              <p style={{ fontSize: 12, color: '#94938E', lineHeight: 1.7, fontFamily: 'var(--font-display)' }}>
                La migration `005_home_hero_settings.sql` doit etre appliquee dans Supabase pour activer cette gestion.
              </p>
            </div>
          )}

          <div style={sectionStyle}>
            <p style={sectionTitle}>Logo & Favicon</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Logo (PNG recommandé)</label>
                {settings?.logo_url && (
                  <div style={{ marginBottom: 10 }}>
                    <img src={settings.logo_url} alt="Logo actuel" style={{ height: 48, objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: 4 }} />
                    <p style={{ fontSize: 10, color: '#4D4D52', marginTop: 4, fontFamily: 'var(--font-display)' }}>Logo actuel</p>
                  </div>
                )}
                <input name="logo" type="file" accept="image/*" style={{ ...inputStyle, padding: '8px' }} />
              </div>
              <div>
                <label style={labelStyle}>Favicon (ICO ou PNG 32x32)</label>
                {settings?.favicon_url && (
                  <div style={{ marginBottom: 10 }}>
                    <img src={settings.favicon_url} alt="Favicon actuel" style={{ height: 32, objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: 4 }} />
                    <p style={{ fontSize: 10, color: '#4D4D52', marginTop: 4, fontFamily: 'var(--font-display)' }}>Favicon actuel</p>
                  </div>
                )}
                <input name="favicon" type="file" accept="image/*,.ico" style={{ ...inputStyle, padding: '8px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="settings-submit" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="submit" style={{
            background: '#7A1620', color: '#fff', border: 'none',
            borderRadius: 3, padding: '12px 32px',
            fontFamily: 'var(--font-display)', fontSize: 12,
            fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </AdminShell>
  )
}
