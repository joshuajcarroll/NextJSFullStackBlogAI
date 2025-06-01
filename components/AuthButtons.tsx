// src/components/AuthButtons.tsx
'use client'; // This component must be a Client Component

import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtons() {
  return (
    <div>
      <SignedIn>
        {/* User is signed in */}
        <p>Welcome back!</p>
        <UserButton afterSignOutUrl="/" /> {/* Clerk's pre-built user menu */}
        <SignOutButton>
          <button onClick={() => console.log('Signed out!')}>Sign Out</button> {/* Custom sign out button */}
        </SignOutButton>
        <Link href="/admin/posts/new" style={{ marginLeft: '10px' }}>
          Go to Admin Area
        </Link>
      </SignedIn>
      <SignedOut>
        {/* User is signed out */}
        <p>You are signed out.</p>
        <SignInButton mode="modal">
          <button>Sign In</button> {/* Button to open Clerk's sign-in modal */}
        </SignInButton>
        <Link href="/auth/signup" style={{ marginLeft: '10px' }}>
          Sign Up
        </Link>
      </SignedOut>
    </div>
  );
}