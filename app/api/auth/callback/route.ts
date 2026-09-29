// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID!;
const CLIENT_SECRET = process.env.VERCEL_APP_CLIENT_SECRET!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // Handle errors from Vercel (e.g., user clicked Cancel)
  const error = url.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(`${url.origin}/auth/error?error=${error}`);
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

  if (!codeVerifier) {
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  const redirectUri = `${url.origin}/api/auth/callback`;

  // Exchange code for tokens
  const tokenResponse = await fetch('https://api.vercel.com/login/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    return NextResponse.redirect(`${url.origin}/auth/error?error=token_exchange_failed`);
  }

  const tokenData = await tokenResponse.json();

  // Store tokens in httpOnly cookies
  cookieStore.set('access_token', tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenData.expires_in, // 1 hour
    path: '/',
  });

  if (tokenData.refresh_token) {
    cookieStore.set('refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  // Clean up PKCE cookie
  cookieStore.delete('oauth_code_verifier');

  return NextResponse.redirect(`${url.origin}/profile`);
}