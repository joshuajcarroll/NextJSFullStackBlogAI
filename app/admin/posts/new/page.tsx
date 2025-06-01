// src/app/admin/posts/new/page.tsx
import { auth } from "@clerk/nextjs/server"; // Import Clerk's auth helper for RSCs
import { redirect } from "next/navigation";
import NewPostFormClient from "./NewPostFormClient";

export default async function NewPostPage() {
  const { userId } = await auth(); // Get the userId from Clerk's auth helper

  if (!userId) {
    // If no userId, the user is not authenticated.
    // The middleware should ideally handle this, but it's good to have a fallback.
    redirect('/auth/signin?callbackUrl=/admin/posts/new');
  }

  // Pass the Clerk userId to your client component
  return <NewPostFormClient authorId={userId} />;
}