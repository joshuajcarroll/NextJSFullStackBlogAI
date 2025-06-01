// src/app/admin/posts/new/page.tsx (Updated for authentication)
import { getServerSession } from "next-auth"; // Import getServerSession
import { redirect } from "next/navigation"; // For redirection
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import authOptions
import NewPostFormClient from "./NewPostFormClient"; // We'll move the form to a client component

// The handler from [...nextauth] route.ts needs to be exported as authOptions
// Update src/app/api/auth/[...nextauth]/route.ts like so:
// export const authOptions = {
//   providers: [...],
//   session: {...},
//   ...
// };
// export { handler as GET, handler as POST } from "./route";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions); // Get session on the server

  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin/posts/new'); // Redirect to sign-in if not authenticated
  }

  // Pass the user ID to the client component
  // Ensure session.user.id is string (from next-auth.d.ts)
  return <NewPostFormClient authorId={session.user.id} />;
}