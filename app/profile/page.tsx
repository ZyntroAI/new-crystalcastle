// app/profile/page.tsx
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Profile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return (
      <div className="p-8">
        <p>Not authenticated.</p>
        <Link href="/" className="text-blue-500 underline">Go home</Link>
      </div>
    );
  }

  const result = await fetch('https://api.vercel.com/login/oauth/userinfo', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const user = result.status === 200 ? await result.json() : null;

  if (!user) {
    return <p>Failed to load profile.</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}