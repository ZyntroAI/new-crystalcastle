I am using Next.js with the App Router and SSR cookies

# Supabase Token Management in Next.js App Router (SSR Cookies)

For Next.js App Router with SSR, the recommended pattern is:

- Use **`@supabase/ssr`** for all auth.  
- Store session in **cookies** (not localStorage).  
- Call **`supabase.auth.getUser()` in middleware** on every protected request to refresh tokens and write updated cookies.[1][2][3][4][5][6]

Below is a minimal, production-ready setup.

***

## 1. Install & env

```bash
npm i @supabase/ssr @supabase/supabase-js
```

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

(Do **not** put the service role key here; only use it in trusted server code if needed.)[4]

***

## 2. Middleware (token refresh + protected routes)

`middleware.ts` at project root:

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so downstream server code sees the refreshed session
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Update response cookies so browser stores them
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This call refreshes expiring tokens and writes new cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Example: protect /dashboard and similar routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. /icon.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

Key points:

- **`getUser()` in middleware** is what triggers token refresh when the access token is near expiry.[2][3][4][5][6]
- `setAll` updates **both** request and response cookies so:
  - Server Components see the refreshed session in the same request.  
  - Browser stores new cookies for subsequent requests.[6][7]
- Protect routes by checking `user` and redirecting if missing.[6][8]

> Performance note: Calling `getUser()` on every request does hit Supabase, but this is the official pattern. If you need to reduce calls, you can decode the JWT expiry in middleware and only call `getUser()` when the token is within ~2 minutes of expiry (see Supabase SSR issue #190).[9]

***

## 3. Server-side client (Server Components & Server Actions)

Create a helper to get a server client with the same cookie logic:

`lib/supabase/server.ts`:

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // In Server Components we can’t directly set cookies; this is mainly for
          // contexts where Next.js allows it (e.g. route handlers, some server actions).
          // For pure Server Components, rely on middleware to keep cookies fresh.
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

Usage in a Server Component:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use user and query data with RLS
  const { data: rows } = await supabase.from('your_table').select('*')

  return <div>...</div>
}
```

Important:

- In **Server Components**, you generally **don’t refresh tokens yourself**; middleware already did that for the current request.[3][4]
- Always use **`getUser()`**, not `getSession()`, in server code.[3][5]

***

## 4. Browser client (Client Components)

`lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Usage in a Client Component:

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
    }
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return <div>{email ? `Logged in as ${email}` : 'Not logged in'}</div>
}
```

Notes:

- The browser client reads the same cookies that middleware writes.[1][10]
- `onAuthStateChange` fires for client-side events (login, logout, token refresh initiated in the browser).[11]

***

## 5. Handling server-side token refresh & UI updates

When middleware refreshes tokens, the browser doesn’t automatically get a JS event. To keep the client in sync after server-side auth changes (e.g., in Server Actions):

- After any server action that changes auth state (login, logout, profile update), call:

```ts
import { useRouter } from 'next/navigation'

const router = useRouter()

// inside server action or after calling it
router.refresh()
```

This forces Next.js to re-run server components and re-read cookies, so the client sees the updated session.[11]

***

## 6. Do NOT set `httpOnly: true` for Supabase cookies

Supabase’s SSR cookies must be readable by the JS client for session restore and `onAuthStateChange` to work correctly. Setting `httpOnly: true` causes:

- Middleware says “authenticated” (server can read cookies).  
- Client components think “logged out” (JS can’t read httpOnly cookies).  
- Leads to redirect loops and broken auth.[12]

Use the default behavior from `@supabase/ssr` (do not manually set `httpOnly`).[12]

***

## 7. Summary of the flow

- **Middleware**:
  - Reads cookies from request.  
  - Calls `supabase.auth.getUser()` → refreshes access token if needed.  
  - Writes updated cookies to both request and response.[1][2][4][5][6]
- **Server Components / Server Actions**:
  - Use `createServerClient` + `getUser()`.  
  - Rely on middleware to keep tokens fresh.[3][4]
- **Client Components**:
  - Use `createBrowserClient`.  
  - Read the same cookies; listen to `onAuthStateChange`.[1][10][11]

If you share your current `middleware.ts` and client/server client setup, I can review them line-by-line and point out any token-management issues specific to your code.

การอ้างอิง:
[1] Supabase SSR Sessions in Next.js App Router (2026 Guide) https://www.iloveblogs.blog/guides/nextjs-supabase-ssr-session-management
[2] Why Supabase Auth Redirects Break in the Next.js App Router https://zaidahmaddev.com/blog/supabase-auth-redirect-broken-nextjs-app-router
[3] Next.js + Supabase Auth — Server-Side Patterns https://www.duskolicanin.com/stack/nextjs-supabase-auth
[4] Making Supabase RLS work correctly in the Next.js App Router ... https://tomodahinata.com/en/blog/nextjs-app-router-supabase-rls-ssr-server-client-auth-guide
[5] Next.js Supabase Auth SSR: Middleware, Server Actions ... https://www.majidpro.com/blog/nextjs-supabase-auth-ssr
[6] Supabase Authentication: Complete Guide with Next.js https://codefromscratch.org/blog/supabase-authentication-complete-guide-with-next-js
[7] Taming Supabase & Next.js Auth: Why Your Users Keep Getting ... https://plainenglish.io/nextjs/taming-supabase-next-js-auth-why-your-users-keep-getting-logged-out-and-how-to-fix-it
[8] Next.js + Supabase: The Complete Integration Guide for 2026 https://www.nextcraft.agency/resources/insights/nextjs-supabase-guide
[9] Single-use refresh tokens + middleware refresh on every ... https://github.com/supabase/ssr/issues/190
[10] Next.js + Supabase: Real-Time Data, RLS & Server Auth with ... https://digital-infuse.com/blog/next-js-mastering-the-react-framework-that-powers-modern-web/nextjs-supabase-real-time-data-rls-and-server-auth-with-app-router
[11] Supabase Auth: onAuthStateChange listener not fired ... https://github.com/orgs/supabase/discussions/44953
[12] ``but Isn't That Insecure?'' https://dev.to/introlohq/why-setting-httponly-on-your-supabase-auth-cookies-breaks-everything-in-nextjs-3eg3
[13] Fix Authentication in Your AI-Built App (2026 Guide) https://vibecoding.app/blog/fix-authentication-ai-app

How do I handle token refresh in server actions instead

In Next.js App Router with Supabase SSR, you **don’t need to manually refresh tokens in server actions** if you’re already calling `supabase.auth.getUser()` in middleware. The middleware refreshes the access token (when needed) and writes updated cookies, and server actions just read those cookies.[1][2][3][4][5][6]

But if you specifically want **token refresh logic inside server actions** (e.g., you don’t run auth middleware on all routes, or you want explicit control), here’s the correct pattern.

***

## Core idea

- In server actions, use **`@supabase/ssr`** with a cookie-based client.  
- Call **`getSession()`** or **`getUser()`**; the SSR client will automatically use the stored refresh token to get a new access token if the current one is expired or near expiry.[2][5][1]
- When the session is refreshed, the client updates the cookies via your `setAll` implementation.

You do **not** call `refreshSession()` directly in server actions the same way you might in client code; instead, you rely on `getSession()` / `getUser()` + the SSR client’s internal refresh logic.[1][2]

***

## Minimal pattern: refresh in server action via `getSession()`

```ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function protectedAction() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Write updated cookies back so future requests use the refreshed session
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // This will:
  // - read current session from cookies
  // - if access token is expired/near expiry, use refresh_token to get a new one
  // - update cookies via setAll
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('Unauthorized')
  }

  const user = session.user

  // Do something authenticated with `user` and/or `supabase`
  const { data, error: dbError } = await supabase
    .from('your_table')
    .select('*')
    .eq('user_id', user.id)

  if (dbError) throw dbError

  // If you changed data that UI depends on:
  revalidatePath('/dashboard')

  return { ok: true, data }
}
```

Key points:

- `getSession()` is the right call in server actions when you care about the **raw session** (access + refresh tokens).[1]
- The SSR client handles token refresh internally if needed; you don’t call `/token` manually.[5][2]
- `setAll` ensures updated cookies are written so subsequent requests (including client components) see the refreshed session.

***

## Using `getUser()` instead

If you only need the user and don’t care about the raw tokens, you can use `getUser()`; it also triggers refresh if needed:

```ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getUserAction() {
  const cookieStore = cookies()

  const supabase = createServerClient(
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  // use `user` ...
}
```

In practice, with `@supabase/ssr`, `getUser()` and `getSession()` both ensure the session is valid and will refresh it if the access token has expired.[2][5][1]

***

## When you *don’t* need this in server actions

If you already have middleware like:

```ts
await supabase.auth.getUser()
```

running on relevant routes, then:

- Tokens are refreshed on every request that hits middleware.  
- Server actions called from those routes already see a fresh session.  

In that common setup, you **do not** need extra refresh logic in server actions; just call `getUser()` or `getSession()` and proceed.[3][4][6]

***

## Summary

- In server actions, use `@supabase/ssr` + cookie-based client.  
- Call `getSession()` (or `getUser()`) and let the SSR client handle refresh-token exchange.[1][2][5]
- Ensure `setAll` writes updated cookies so the refreshed session persists.  
- If you already refresh in middleware, server actions usually need no special handling beyond `getUser()`/`getSession()`.[3][4][6]

If you share your current server action code, I can show exactly where to add/adjust `getSession()` / `getUser()` and cookie handling.

การอ้างอิง:
[1] Setting up Server-Side Auth for Next.js | Supabase Docssupabase.com › docs › guides › auth › server-side › nextjs https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs
[2] @supabase/server https://supabase.com/docs/guides/auth/choosing-a-server-package
[3] Supabase Auth + Next.js: Complete Authentication Guide (2026) https://designrevision.com/blog/supabase-auth-nextjs
[4] Supabase + Next.js 15: Complete Full-Stack Guide (2026) https://stacknotice.com/blog/supabase-nextjs-15-complete-guide-2026
[5] @supabase/ssr: Cookie-Based Auth for SSR Frameworks https://openapps.pro/packages/supabase-ssr
[6] Fix Supabase JWT Expired (PGRST301) in Next.js - GuardLayer https://www.guardlayer.io/blog/supabase-jwt-expired
