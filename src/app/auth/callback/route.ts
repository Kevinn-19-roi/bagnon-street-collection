import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmailOnceAfterConfirmation } from '@/lib/email/notifications'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/admin')) {
    return '/'
  }
  return value
}

function authErrorUrl(requestUrl: URL, message: string) {
  return NextResponse.redirect(new URL(`/connexion?error=${encodeURIComponent(message)}`, requestUrl.origin))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = safeNext(requestUrl.searchParams.get('next'))
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, requestUrl.origin))

    return authErrorUrl(requestUrl, 'Lien invalide ou expiré.')
  }

  if (tokenHash) {
    if (!type) return authErrorUrl(requestUrl, 'Lien incomplet. Demande un nouveau lien.')

    const allowedTypes = new Set(['signup', 'recovery', 'invite', 'magiclink', 'email_change'])
    if (!allowedTypes.has(type)) return authErrorUrl(requestUrl, 'Type de lien invalide.')

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })

    if (!error) {
      if (type === 'signup') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return authErrorUrl(requestUrl, 'Session de confirmation introuvable. Connecte-toi pour continuer.')
        if (!user.email_confirmed_at) return authErrorUrl(requestUrl, 'Ton adresse email n’est pas encore confirmée.')

        await sendWelcomeEmailOnceAfterConfirmation(user.id)
      }

      const target = type === 'recovery' ? '/reinitialiser-mot-de-passe' : next
      return NextResponse.redirect(new URL(target, requestUrl.origin))
    }

    return authErrorUrl(requestUrl, 'Lien invalide ou expiré. Demande un nouveau lien.')
  }

  return authErrorUrl(requestUrl, 'Lien manquant. Demande un nouveau lien.')
}
