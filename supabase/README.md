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


# 🧠 Deep Research: Supabase Full Platform Guide
Comprehensive breakdown of **all topics** from the footer + core architecture, features, compliance, and use cases.

---

## 📑 Table of Contents
1. **Product Core** — Database, Auth, Functions, Realtime, Storage, Vector, Cron
2. **Solutions by Audience/Industry** — AI, Enterprise, Healthcare, FinServ, Agencies, etc.
3. **Security & Compliance** — HIPAA, SOC 2, GDPR, RLS, Encryption
4. **Developer Ecosystem** — Docs, Libraries, CI/CD, MCP
5. **Resources & Community** — Support, Open Source, Events
6. **Architecture & Tech Stack** — Postgres, Deno, Edge, Network
7. **Migration Paths** — From Firebase, Neon, MySQL, MSSQL
8. **Pricing & Scaling** — Tiers, Compute, Replicas

---

## 🚀 1. PRODUCT CORE — Deep Dive

### 🗄️ Database (Postgres 100%)
✅ **Pure Postgres**: No forks; full SQL, ACID, standards-compliant  
✅ **Auto-Generated APIs**: REST/GraphQL/JSON instantly  
✅ **Row Level Security (RLS)**: Native row-level isolation  
✅ **Extensions**: 40+ pre-installed — pgvector, PostGIS, pg_cron, pgcrypto  
✅ **Dev Tools**: SQL Editor, Table GUI, Diagrams, Query Plan Explainer  
✅ **Performance**: Connection Pooler (Supavisor), Read Replicas, PITR, Backups

### 🔐 Authentication
✅ **Methods**: Email/Password, Magic Link, OAuth (Google/GitHub/Apple), SAML/SSO, Phone/SMS OTP  
✅ **Features**: JWT auto-injected, RBAC, MFA, Passwordless, Auth Hooks  
✅ **Integration**: Directly ties into Postgres RLS (`auth.uid()`)  
✅ **Enterprise**: SSO, Custom JWT Claims, Domain Restrictions

### ⚡ Edge Functions
✅ **Runtime**: Deno 2.0 — TypeScript-first, secure sandbox  
✅ **Deploy**: Global low-latency OR pinned near DB  
✅ **Auto-Env**: `SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` built-in  
✅ **Use Cases**: Webhooks (Stripe), Auth Hooks, AI/LLM, PDF parsing, Email  
✅ **Dev**: `supabase functions serve` hot reload, local testing

### 🔄 Realtime
✅ **Postgres Logical Replication**: No polling — true push  
✅ **Channels**: Listen to inserts/updates/deletes; filter by user/RLS  
✅ **Presence**: Track online/offline; sync collaborative UIs  
✅ **Broadcast**: Send messages between clients directly  
✅ **Scale**: Distributed globally; works with RLS out of box

### 📦 Storage
✅ **S3-Compatible**: Buckets, folders, permissions via RLS  
✅ **Features**: Image Transform (resize/format), CDN, Signed URLs, TTL  
✅ **Security**: No public access by default; policies tied to `auth.uid()`  
✅ **Use**: Avatars, medical files, PDFs, backups, media

### 🧩 Vector / AI
✅ **pgvector**: Built-in extension — `vector(1536)` columns  
✅ **Indexing**: HNSW (fast) / IVFFlat (large scale)  
✅ **Search**: Cosine, L2, Dot Product; hybrid SQL+semantic  
✅ **RAG Ready**: Store docs + embeddings + auth in one DB  
✅ **Scale**: Millions of vectors + ACID + backups

### ⏱️ Cron Jobs
✅ **pg_cron**: Native database scheduler  
✅ **Schedule**: `* * * * *` syntax  
✅ **Run**: SQL queries, functions, RPC calls  
✅ **Use**: Cleanup, reports, embeddings sync, summaries

---

## 🎯 2. SOLUTIONS — All Verticals

### 🤖 AI Builders
✅ **All-in-One**: Vector DB + Auth + Edge Functions + Storage  
✅ **RAG Pipeline**: Embeddings → Store → Query → Generate  
✅ **Local Option**: Ollama integration + GPU detection  
✅ **MCP Server**: Connect to Cursor/VS Code/Claude AI  
✅ **Streaming**: Real-time chat SSE responses

### 🏢 Enterprise
✅ **Compliance**: SOC 2 Type II, HIPAA, GDPR  
✅ **Support**: 24/7 Global + Dedicated CSE  
✅ **Scale**: Multi-AZ, HA, Read Replicas, Private Link  
✅ **Security**: Audit Logs, RBAC, RLS, Network Restrictions

### 🏥 Healthcare
✅ **HIPAA + Signed BAA**: Official Business Associate Agreement  
✅ **Audit Logging**: Full access tracking  
✅ **RLS**: Patient/provider isolation  
✅ **Encryption**: At rest + TLS 1.3  
✅ **Data Residency**: US/EU region lock

### 🏦 FinServ
✅ **ACID Postgres**: Transactions safe for finance  
✅ **Audit**: Full log retention  
✅ **SOC 2**: Controls validated  
✅ **Low Latency**: Edge + optimized pooler

### 🏢 B2B SaaS
✅ **Multi-Tenant**: RLS-based isolation  
✅ **No Lock-In**: Pure Postgres — export anytime  
✅ **Scale**: MVP → Enterprise same platform

### 🧑‍💻 Vibe Coders / Hackathons
✅ **Speed**: 30-second project creation  
✅ **Local Dev**: `supabase start` full stack offline  
✅ **Auto-Types**: TS/Pydantic generation  
✅ **One-Click Deploy**

### 🚀 Startups / Agencies
✅ **Free Tier**: Generous limits to launch  
✅ **Managed**: No DB maintenance  
✅ **Portable**: Self-host option later

### 🔄 Migration Paths
✅ **From Firebase**: Auth, Data, Storage import  
✅ **From Neon**: Postgres dump/restore  
✅ **From MySQL/MSSQL**: Logical replication or dump  
✅ **From Heroku/Render**: Guided tools

---

## 🛡️ 3. SECURITY & COMPLIANCE — Deep
### ✅ Certifications
- **SOC 2 Type II**: Full audit controls
- **HIPAA**: BAA available
- **GDPR**: Data residency
- **PCI-DSS Ready**: Architecture compliant

### 🔒 Core Security
- **Encryption**: Disk + Transit TLS 1.3
- **Access**: RLS + RBAC + SSO + MFA
- **Network**: IP Whitelist, PrivateLink, DDoS
- **Audit**: Logs retained, query logs, auth logs
- **Isolation**: Compute per-project, no shared resources

---

## 🧱 4. ARCHITECTURE OVERVIEW
```
Client ←→ Supavisor(Pooler) ←→ Postgres DB
                  ↓
        Edge Functions (Global)
                  ↓
        Auth / Realtime / Storage
```
✅ **Postgres**: Core — 15/16 latest  
✅ **Supavisor**: Smart connection pooling (10k+ connections)  
✅ **Deno**: Edge runtime — fast, secure  
✅ **Network**: AWS/GCP multi-region, CDN, Anycast

---

## 🛠️ 5. DEV WORKFLOW
### 📥 Install
```bash
npm i @supabase/supabase-js
brew install supabase/cli
```
### 📁 Local
```bash
supabase start      # Full stack offline
supabase db push    # Schema to cloud
supabase functions serve
```
### 🚢 Deploy
```bash
supabase functions deploy
supabase db push
```

### 📝 Schema/Migration
- SQL-first
- Migrations in `supabase/migrations`
- Seed data
- `supabase/functions`
- Type generation: `supabase gen types`

---

## 📊 6. SCALE & PRICING
### 📈 Tiers
- Free → Pro → Team → Enterprise
### ⚙️ Compute
- Micro → Small → Medium → Large → XL
### 📉 Limits
- Connections: Pooled 500–10k+
- DB Size: Up to TBs
- Edge: Million invocations/mo

---

## 📚 7. RESOURCES & LINKS
- Docs: https://supabase.com/docs
- Changelog: https://supabase.com/changelog
- Status: https://status.supabase.com
- GitHub: https://github.com/supabase
- Discord: https://discord.supabase.com
- Security: https://supabase.com/security
- Open Source: MIT licensed

---

Would you like me to **expand any specific topic** into a full detailed guide (e.g., RLS patterns, pgvector RAG, migration checklist, Edge Function security)?


# 📖 Full Detailed Guide — Row Level Security (RLS) in Supabase
**The Foundation of Secure, Multi-Tenant Applications**

---

## 🎯 What Is Row Level Security?
**Row Level Security (RLS)** is a **Postgres-native security feature** that restricts *which rows each user can read or write* — automatically, at the database level. Supabase builds on it so your auth and data stay perfectly aligned.

> Instead of filtering in your app code → **Postgres enforces it everywhere**.

✅ **Enforced Everywhere**: Dashboard, API, direct DB connections, Edge Functions  
✅ **Zero Leakage**: Impossible to bypass — policies run inside Postgres  
✅ **Performance**: Policies use indexes — no performance hit  
✅ **Works With Auth**: `auth.uid()`, `auth.jwt()`, custom claims built-in

---

## 🔑 Core Concepts

### 1. Policy = Rule
A policy says: **Who can do what on which rows**.
```sql
CREATE POLICY "Users see only their own rows"
ON public.documents
FOR SELECT USING ( auth.uid() = user_id );
```

### 2. Two Key Clauses
- **`USING`** — Filter rows *before* operation (read/check existence)
- **`WITH CHECK`** — Validate rows *before writing* (insert/update)

### 3. States
- **ENABLE/DISABLE ROW LEVEL SECURITY** — Turn on per table
- **FORCE ROW LEVEL SECURITY** — Even service/admin role respects policies (optional)

---

## 🚀 Step-by-Step Implementation

### Step 1 — Prepare Your Schema
```sql
-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create a table linked to auth.users
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
```

### Step 2 — Basic Policies (Single-User Isolation)
```sql
-- ✅ Users can view only their own documents
CREATE POLICY "Users can view own documents"
ON public.documents
FOR SELECT
USING ( auth.uid() = user_id );

-- ✅ Users can insert their own documents
CREATE POLICY "Users can create documents"
ON public.documents
FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- ✅ Users can update their own documents
CREATE POLICY "Users can update own documents"
ON public.documents
FOR UPDATE
USING ( auth.uid() = user_id )                -- existing row matches
WITH CHECK ( auth.uid() = user_id );          -- new row matches

-- ✅ Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON public.documents
FOR DELETE
USING ( auth.uid() = user_id );
```

### Step 3 — Simplify with a Helper Function
```sql
-- Reusable: automatically sets user_id on insert
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER set_user_id_before_insert
BEFORE INSERT ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Now INSERT policies don't need to check user_id — it's automatic!
```

---

## 🏢 Advanced Patterns

### Pattern A — Multi-Tenant / Organization Isolation
```sql
-- Schema: organizations ↔ members ↔ documents
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin','owner')),
  UNIQUE(org_id, user_id)
);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT
);

-- 🔒 Policy: Users see only their org's documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view documents"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.org_id = documents.org_id
    AND m.user_id = auth.uid()
  )
);

-- 🔒 Policy: Only admins can write
CREATE POLICY "Admins can manage documents"
ON public.documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.org_id = documents.org_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin','owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.org_id = documents.org_id
    AND m.user_id = auth.uid()
    AND m.role IN ('admin','owner')
  )
);
```

### Pattern B — Public / Shared Data
```sql
-- Allow anyone to read (even unauthenticated)
CREATE POLICY "Public documents readable by anyone"
ON public.documents
FOR SELECT
USING ( is_public = true OR auth.uid() = user_id );
```

### Pattern C — JWT Custom Claims (Advanced Roles)
```sql
-- From your auth token: app_metadata → { "role": "manager" }
CREATE POLICY "Managers see all rows"
ON public.documents
FOR ALL
USING ( auth.jwt() ->> 'role' = 'manager' );
```

### Pattern D — Disable for Service Role (Admin Access)
```sql
-- Service role bypasses RLS by default — safe for backend/admin
-- To ENFORCE RLS even on service role:
ALTER TABLE public.documents FORCE ROW LEVEL SECURITY;
```

---

## ✅ Production Checklist

### ✅ Schema & Setup
- [ ] Every table has `user_id UUID REFERENCES auth.users(id)` or `org_id`
- [ ] **RLS ENABLED** on EVERY table (don't forget!)
- [ ] Foreign keys validated
- [ ] `created_at` / `updated_at` triggers

### ✅ Policies
- [ ] **SELECT** — users see only authorized rows
- [ ] **INSERT** — can't impersonate others
- [ ] **UPDATE** — can't take over others' rows
- [ ] **DELETE** — restricted appropriately
- [ ] No overly permissive `true` policies (unless intentional)

### ✅ Testing
```sql
-- Test as specific user
SET ROLE TO authenticated;
SET LOCAL jwt.claims.sub TO 'user-uuid-here';

-- Should return ONLY your rows
SELECT * FROM public.documents;
```

### ✅ Common Pitfalls to Avoid
| ❌ Mistake | ✅ Fix |
|---|---|
| Forgot to enable RLS | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` |
| Missing `WITH CHECK` on INSERT/UPDATE | Always include both `USING` + `WITH CHECK` |
| Policy uses `id` instead of `user_id` | Reference the foreign key to auth.users |
| Infinite recursion in policies | Avoid querying same table inside policy |
| Service role access leaking | Test with anon key, not service key |

---

## 📝 Policy Template Library

### 🔹 Standard CRUD (Copy-Paste)
```sql
-- Read own
CREATE POLICY "Read own" ON table_name FOR SELECT USING ( auth.uid() = user_id );

-- Insert own
CREATE POLICY "Insert own" ON table_name FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Update own
CREATE POLICY "Update own" ON table_name FOR UPDATE USING ( auth.uid() = user_id ) WITH CHECK ( auth.uid() = user_id );

-- Delete own
CREATE POLICY "Delete own" ON table_name FOR DELETE USING ( auth.uid() = user_id );
```

### 🔹 Authenticated Only
```sql
CREATE POLICY "All authenticated can read" ON table_name FOR SELECT TO authenticated USING ( true );
```

### 🔹 Public Read, Owner Write
```sql
CREATE POLICY "Public read" ON table_name FOR SELECT USING ( true );
CREATE POLICY "Owner write" ON table_name FOR ALL USING ( auth.uid() = user_id ) WITH CHECK ( auth.uid() = user_id );
```

---

## 🧪 Test Your Policies
```bash
# Local dev — Supabase auto-generates test helpers
supabase db reset
supabase test db           # Runs pgTAP tests
```

---

## 📚 Resources
🔗 **Official RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security  
🔗 **Postgres RLS**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html  
🔗 **Auth Helpers**: `auth.uid()`, `auth.jwt()`, `auth.role()`

---

Would you like me to expand **any other topic** into a similarly detailed guide — such as **pgvector + RAG**, **Edge Functions patterns**, **Stripe webhook integration**, or **multi-region HA setup**?
[5] @supabase/ssr: Cookie-Based Auth for SSR Frameworks https://openapps.pro/packages/supabase-ssr
[6] Fix Supabase JWT Expired (PGRST301) in Next.js - GuardLayer https://www.guardlayer.io/blog/supabase-jwt-expired
