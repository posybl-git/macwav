import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'
  const flow = searchParams.get('flow')
  const isSignupConfirmationFlow = flow === 'signup-confirmation' || type === 'signup'
  const supabase = await createClient()

  const redirectToNext = () => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const redirectToLogin = () => NextResponse.redirect(`${origin}/`)

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (isSignupConfirmationFlow) {
        await supabase.auth.signOut()
        return redirectToLogin()
      }

      return redirectToNext()
    }

    if (isSignupConfirmationFlow) {
      return redirectToLogin()
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    })

    if (!error) {
      if (isSignupConfirmationFlow) {
        await supabase.auth.signOut()
        return redirectToLogin()
      }

      return redirectToNext()
    }

    if (isSignupConfirmationFlow) {
      return redirectToLogin()
    }
  }

  if (isSignupConfirmationFlow) {
    return redirectToLogin()
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
