// src/app/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server"; // For server-side access to auth and user data
import AuthButtons from "@/components/AuthButtons"; // Import the client component
import Link from "next/link";

export default async function HomePage() {
  // Get authentication state on the server
  const { userId } = await auth(); // Contains basic auth info like userId, sessionId
  const user = await currentUser(); // Contains full user object if authenticated

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Your App!</h1>

      {/* Render the client component for interactive buttons */}
      <AuthButtons />

      <hr style={{ margin: '20px 0' }} />

      <h2>Server-Side User Info:</h2>
      {userId ? (
        <div>
          <p>You are signed in!</p>
          <p>Your User ID: <strong>{userId}</strong></p>
          {user && (
            <>
              <p>Hello, {user.firstName || user.emailAddresses[0]?.emailAddress}!</p>
              {/* You can display more user data from the `user` object */}
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </>
          )}
        </div>
      ) : (
        <p>You are not signed in on the server.</p>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h2>Public Links:</h2>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/auth/signin">Sign In Page</Link></li>
        <li><Link href="/auth/signup">Sign Up Page</Link></li>
        <li><Link href="/admin/posts/new">Protected Admin Area</Link></li>
      </ul>
    </main>
  );
}