// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (accessToken) {
    // Revoke the token
    await fetch('https://api.vercel.com/login/oauth/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: accessToken }),
    });
  }

  // Clear cookies
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  return NextResponse.redirect(new URL('/', request.url));
}