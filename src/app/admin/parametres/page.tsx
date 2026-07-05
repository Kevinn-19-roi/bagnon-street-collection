import AdminShell from '@/components/admin/layout/AdminShell'
import PageHeader from '@/components/admin/ui/PageHeader'
import { getSettings, updateSettings } from '@/lib/actions/settings'

export const metadata = { title: 'Paramètres — Admin BSC' }
export const dynamic = 'force-dynamic'

export default async function ParametresPage() {
  const settings = await getSettings()

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
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
