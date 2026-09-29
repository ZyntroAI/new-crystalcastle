// app/components/sign-in-with-vercel-button.tsx
export default function SignInWithVercelButton() {
  return (
    <a
      href="/api/auth/authorize"
      className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
    >
      Sign in with Vercel
    </a>
  );
}