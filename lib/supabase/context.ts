// lib/supabase/context.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from '@supabase/server/core'

export async function createSupabaseContext() {
  const cookieStore = await cookies()
  const ssrClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await ssrClient.auth.getSession()
  const token = session?.access_token ?? null

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: 'user' }
  )

  if (error) return { data: null, error }

  const supabase = createContextClient({ auth: { token: auth!.token } })
  const supabaseAdmin = createAdminClient({})

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
    },
    error: null,
  }
}
