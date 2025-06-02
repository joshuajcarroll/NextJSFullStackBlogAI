// src/components/EditPostClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PostFormClient from './PostFormClient'; // Make sure this path is correct

// Define the expected structure of the post data
interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  videoUrl?: string | null;
  authorId: string;
  author: {
    id: string;
    clerkId: string;
    name: string;
    email: string;
  };
}

interface EditPostClientProps {
  initialPost: Post;
  currentUserId: string; // The Clerk ID of the currently logged-in user
}

export default function EditPostClient({ initialPost, currentUserId }: EditPostClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the current user is authorized to edit/delete this post
  // This is a client-side check for UX, but the server-side API also enforces it.
  const isAuthor = initialPost.author.clerkId === currentUserId;

  // Function to handle post update (PUT request)
  const handleUpdatePost = async (formData: { title: string; content: string; published: boolean; videoUrl?: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!isAuthor) {
        throw new Error("You are not authorized to edit this post.");
      }

      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      const updatedPost = await response.json();
      alert('Post updated successfully!');
      router.push(`/blog/${updatedPost.id}`); // Redirect to the updated post's page
      router.refresh(); // Revalidate data on the client to show changes
    } catch (err: unknown) {
      console.error('Error updating post:', err);
      if (err instanceof Error) {
        setError(err.message || 'Could not update post.');
      } else {
        setError('Could not update post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle post deletion (DELETE request)
  const handleDeletePost = async () => {
    if (!isAuthor) {
      alert("You are not authorized to delete this post.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return; // User cancelled
    }

    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      alert('Post deleted successfully!');
      router.push('/blog'); // Redirect to the blog listing page
      router.refresh(); // Revalidate data
    } catch (err: unknown) {
      console.error('Error deleting post:', err);
      if (err instanceof Error) {
        setError(err.message || 'Could not delete post.');
      } else {
        setError('Could not delete post.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthor) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700 mb-6">You do not have permission to edit or delete this post.</p>
        <button
          onClick={() => router.push('/blog')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
        >
          Back to Blog
        </button>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Edit Blog Post
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <PostFormClient
        initialData={{
          title: initialPost.title,
          content: initialPost.content,
          published: initialPost.published,
          videoUrl: initialPost.videoUrl || '', // Ensure videoUrl is a string
        }}
        onSubmit={handleUpdatePost}
        isSubmitting={isSubmitting}
        submitButtonText="Save Changes"
      />

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleDeletePost}
          disabled={isDeleting || isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isDeleting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
          }`}
        >
          {isDeleting ? 'Deleting...' : 'Delete Post'}
        </button>
      </div>
    </div>
  );
}