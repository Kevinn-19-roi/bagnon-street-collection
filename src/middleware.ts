import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const ADMIN_LOGIN = '/admin/login'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const isAdminLogin = pathname === ADMIN_LOGIN
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (isAdminLogin) return response

    const loginUrl = new URL(ADMIN_LOGIN, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (admin) {
    if (isAdminLogin) return NextResponse.redirect(new URL('/admin/dashboard', request.url))

    response.headers.set('x-admin-role', admin.role)
    return response
  }

  if (isAdminLogin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
