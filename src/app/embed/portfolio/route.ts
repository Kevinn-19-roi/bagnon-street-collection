import { createClient } from '@supabase/supabase-js'
import { embedPolicy, escapeHtml as e, publicImage } from '@/lib/portfolio-embed'

export const dynamic = 'force-dynamic'

// Anonymous catalogue only; intentionally independent of auth/cart providers.
export async function GET() {
  const policy=embedPolicy().replace("style-src 'unsafe-inline'", "style-src 'unsafe-inline' https://fonts.googleapis.com").replace("font-src 'self'", "font-src 'self' https://fonts.gstatic.com")
  const headers={ 'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':policy,'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()' }
  try {
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if(!url||!key)throw new Error('Public configuration unavailable')
    const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
    const [products,settings]=await Promise.all([
      db.from('products').select('name,description,short_description,price,images:product_images(image_url,display_order)').eq('active',true).order('created_at',{ascending:false}).limit(18),
      db.from('site_settings').select('hero_title,hero_description,hero_image_url,brand_quote,brand_quote_author').limit(1).maybeSingle(),
    ])
    if(products.error||settings.error)throw new Error('Public catalogue unavailable')
    const image=(value:unknown,title:unknown)=>{const src=publicImage(value);return src?`<img loading="lazy" src="${src}" alt="${e(title)}">`:''}
    const hero=settings.data
    return new Response(`<!doctype html><html lang="fr" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bagnon Street — aperçu catalogue</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&amp;family=Inter:wght@400;500&amp;display=swap"><style>
      *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:80px}body{margin:0;background:#f6f5f1;color:#0f0f11;font:16px/1.6 Inter,sans-serif}nav{position:sticky;top:0;z-index:1;background:#f6f5f1;display:flex;gap:24px;flex-wrap:wrap;padding:14px 6%;border-bottom:1px solid #d2cfc8}nav a{padding:6px 0}a{color:inherit;text-underline-offset:5px}a:focus-visible,summary:focus-visible{outline:2px solid #7a1620;outline-offset:4px}main{max-width:1200px;margin:auto;padding:32px 6%}h1,h2,h3{font-family:'Space Grotesk',sans-serif;line-height:1.15;overflow-wrap:anywhere}h1{font-size:clamp(34px,7vw,72px)}h2{font-size:32px}h3{font-size:22px}section{padding:28px 0}p{max-width:70ch;white-space:pre-line}img{display:block;width:100%;aspect-ratio:4/5;object-fit:contain}#marque>img{aspect-ratio:16/9;object-fit:cover;max-height:420px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:32px}article{min-width:0}small{color:#5c5b57}blockquote{margin:32px 0;font:28px/1.4 'Space Grotesk',sans-serif}details{margin-bottom:24px}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
    </style></head><body><nav aria-label="Aperçu catalogue"><a href="#marque">Bagnon Street</a><a href="#collection">Collection</a><a href="#manifeste">La marque</a></nav><main><small>Aperçu public · lecture seule</small><section id="marque"><h1>${e(hero?.hero_title||'Bagnon Street')}</h1><p>${e(hero?.hero_description)}</p>${image(hero?.hero_image_url,'Bagnon Street')}</section><section id="collection"><h2>Collection</h2><div class="grid">${(products.data??[]).map(item=>{const cover=[...(item.images??[])].sort((a,b)=>a.display_order-b.display_order)[0];return `<article>${image(cover?.image_url,item.name)}<h3>${e(item.name)}</h3><p>${Number.isFinite(item.price)?e(new Intl.NumberFormat('fr-CI',{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(item.price)):''}</p><p>${e(item.short_description)}</p><details><summary>Découvrir la pièce</summary><p>${e(item.description)}</p></details></article>`}).join('')||'<p>Aucun produit public disponible actuellement.</p>'}</div></section>${hero?.brand_quote?`<section id="manifeste"><h2>La marque</h2><blockquote>${e(hero.brand_quote)}</blockquote><p>${e(hero.brand_quote_author)}</p></section>`:'<section id="manifeste"><h2>Bagnon Street</h2></section>'}<p>Vitrine de consultation uniquement. Aucun panier, compte, commande ou paiement dans cet aperçu.</p></main></body></html>`,{headers})
  }catch{
    return new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Aperçu indisponible</title><p>Le catalogue public est temporairement indisponible. Ouvrez le site officiel depuis le portfolio.</p></html>',{status:503,headers})
  }
}
