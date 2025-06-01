// src/app/admin/posts/new/NewPostFormClient.tsx
'use client'; // This is a client component

import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
import { useState } from 'react';

interface NewPostFormClientProps {
  authorId: string; // This ID is passed from the server component
}

export default function NewPostFormClient({ authorId }: NewPostFormClientProps) {
  const { isLoaded, isSignedIn } = useUser(); // Client-side user info from Clerk
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isLoaded || !isSignedIn) {
    // Handle loading state or not signed in on the client if needed
    return <p>Loading user...</p>;
  }

  // You can still use the authorId passed from the server,
  // or use user.id directly if you prefer client-side fetching for some reason.
  // console.log("Client-side user ID:", user.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send your post data to an API route
    console.log({ title, content, authorId });
    alert('Post submitted (check console)!');
    // Example fetch:
    // const response = await fetch('/api/posts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ title, content, authorId }),
    // });
    // const data = await response.json();
    // console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Post</h1>
      <p>Author ID: {authorId}</p> {/* Using ID passed from server */}
      {/* Or, if you need client-side user details: <p>Client User Name: {user?.fullName}</p> */}
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create Post</button>
    </form>
  );
}