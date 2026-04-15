import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const getRole = async (userId: string) => {
    const { data } = await (admin.from('profiles') as any)
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    return data?.role ?? null
  }

  const path = request.nextUrl.pathname

  // Define route groups
  const isAuthRoute = path === '/' || path.startsWith('/auth')
  const isAdminRoute = path.startsWith('/admin')
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/songs') ||
    path.startsWith('/credits') ||
    path.startsWith('/schedule') ||
    path.startsWith('/profile')

  const isArtistRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/songs') ||
    path.startsWith('/credits') ||
    path.startsWith('/schedule') ||
    path.startsWith('/profile')

  // Unauthenticated user trying to access protected routes
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Authenticated user on login/signup pages → redirect to dashboard
  if (user && isAuthRoute) {
    const role = await getRole(user.id)

    const url = request.nextUrl.clone()
    if (role === 'admin') {
      url.pathname = '/admin'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  if (user && isArtistRoute) {
    const role = await getRole(user.id)

    if (role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // Artist trying to access admin routes
  if (user && isAdminRoute) {
    const role = await getRole(user.id)

    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
