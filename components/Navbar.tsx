// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section - Changed to a Blog Icon */}
        <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition duration-200">
          {/* Blog-themed Pen Icon (from Heroicons) */}
          <svg
            xmlns="http://www.www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
          <span className="text-2xl font-bold tracking-tight">My Awesome Blog</span> {/* Updated text */}
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-white text-lg font-medium hover:text-gray-200 transition duration-200">
            Home
          </Link>
          <Link href="/admin/posts/new" className="text-white text-lg font-medium hover:text-gray-200 transition duration-200">
            Admin
          </Link>
          {/* Add more links as needed */}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}