// src/components/Navbar.tsx
'use client'; // This will be a Client Component due to interactive elements

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition duration-200">
          {/* You can replace this SVG with an <img> tag for your actual logo */}
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-1.25-3M3.5 7h1.096A3.999 3.999 0 008 4c.646 0 1.257.199 1.764.536l.707-.707A5.98 5.98 0 008 2C4.686 2 2 4.686 2 8s2.686 6 6 6l.5.5H16l.5-.5c3.314 0 6-2.686 6-6s-2.686-6-6-6A5.98 5.98 0 0015.793 4.829l.707.707A3.999 3.999 0 0019.404 7H20.5a.5.5 0 01.5.5v8a.5.5 0 01-.5.5h-17a.5.5 0 01-.5-.5v-8A.5.5 0 013.5 7z"
            ></path>
          </svg>
          <span className="text-2xl font-bold tracking-tight">ClerkApp</span>
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
            {/* Show UserButton (profile menu) if signed in */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            {/* Show Sign In button if signed out */}
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