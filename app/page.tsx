// src/app/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import AuthButtons from "@/components/AuthButtons";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      {/* Page Title */}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight">
        Welcome to Your <span className="text-blue-600">Sleek App</span>!
      </h1>

      {/* Auth Buttons Section */}
      <section className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Authentication Status</h2>
        <AuthButtons />
      </section>

      {/* Server-Side User Info Section */}
      <section className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Server-Side User Info</h2>
        {userId ? (
          <div className="text-gray-700">
            <p className="mb-2">You are signed in! 🎉</p>
            <p className="mb-2">Your User ID: <code className="bg-gray-100 p-1 rounded font-mono text-sm">{userId}</code></p>
            {user && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-semibold text-blue-800 mb-2">Hello, {user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}!</p>
                <p className="text-blue-700 text-sm">Full User Object (for debugging):</p>
                <pre className="mt-2 bg-blue-900 text-white p-3 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">You are not signed in on the server.</p>
        )}
      </section>

      {/* Public Links Section */}
      <section className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Navigation</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Home Page
            </Link>
          </li>
          <li>
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Go to Sign In
            </Link>
          </li>
          <li>
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              Go to Sign Up
            </Link>
          </li>
          <li>
            <Link href="/admin/posts/new" className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200">
              Go to Protected Admin Area (New Post)
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}