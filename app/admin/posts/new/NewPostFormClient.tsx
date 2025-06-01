// src/app/admin/posts/new/NewPostFormClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface NewPostFormClientProps {
  authorId: string; // This ID is passed from the server component (Clerk's userId)
}

export default function NewPostFormClient({ authorId }: NewPostFormClientProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }), // authorId is handled by the API route internally
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      console.log('Post created successfully:', newPost);
      alert('Post created successfully!');
      setTitle('');
      setContent('');
      router.push(`/blog/${newPost.id}`); // Redirect to the new post's page
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error creating post:', error.message);
        alert(`Error creating post: ${error.message}`);
      } else {
        console.error('Error creating post:', error);
        alert('An unknown error occurred while creating the post.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Blog Post</h1>
      <p className="text-gray-600 mb-6 text-center">
        Logged in as user with Clerk ID: <code className="bg-gray-100 p-1 rounded font-mono">{authorId}</code>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base"
            placeholder="Enter post title"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base"
            placeholder="Write your blog post content here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {loading ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}