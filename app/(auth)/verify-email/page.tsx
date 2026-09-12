'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
      verifyToken(t);
    }
  }, []);

  async function verifyToken(t: string) {
    setStatus('verifying');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t }),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card className="shadow-lg border-0 text-center">
      <CardHeader className="space-y-4">
        {status === 'verifying' && <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />}
        {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />}
        {status === 'error' && <XCircle className="h-16 w-16 text-red-500 mx-auto" />}
        {status === 'idle' && <MailCheck className="h-16 w-16 text-blue-500 mx-auto" />}

        <CardTitle className="text-2xl font-bold">
          {status === 'verifying' && 'Verifying...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'idle' && 'Check your email'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-500">
        {status === 'idle' && <p>We've sent a confirmation link to your email.</p>}
        {status === 'success' && <p>Your email has been verified. You can now sign in.</p>}
        {status === 'error' && <p>This link is invalid or has expired.</p>}
      </CardContent>
      <CardFooter className="flex-col space-y-3">
        {status === 'success' && (
          <Button asChild className="w-full">
            <Link href="/login">Continue to Sign In <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        )}
        {status === 'error' && (
          <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        )}
        {status === 'idle' && (
          <p className="text-xs text-slate-400">Link expires in 24 hours</p>
        )}
      </CardFooter>
    </Card>
  );
}
