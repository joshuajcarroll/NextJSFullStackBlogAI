// src/components/Navbar.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession(); // Access session data

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          AI Blog
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/blog" className="hover:text-gray-300">
            Blog
          </Link>
          {status === 'loading' ? (
            <span>Loading...</span>
          ) : session?.user ? (
            <>
              <Link href="/admin/posts/new" className="hover:text-gray-300">
                Create Post
              </Link>
              <span className="text-gray-300">Hello, {session.user.name || session.user.email}!</span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-gray-300">
                Sign In
              </Link>
              <Link href="/auth/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}