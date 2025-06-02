// src/components/PostFormClient.tsx
'use client'; // This is a client component

import React, { useState, useEffect } from 'react';

// Define the shape of the data the form handles
interface PostFormData {
  title: string;
  content: string;
  published: boolean;
  videoUrl?: string; // Optional video URL
}

// Define the props for our reusable form component
interface PostFormProps {
  initialData?: PostFormData; // Optional: for pre-filling when editing
  onSubmit: (data: PostFormData) => Promise<void>; // Function to call on form submission
  isSubmitting: boolean; // To disable inputs during submission
  submitButtonText: string; // Text for the submit button (e.g., "Create Post", "Save Changes")
}

export default function PostFormClient({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [published, setPublished] = useState(initialData?.published ?? false); // Default to false if not provided
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');

  // Effect to update form state if initialData changes (e.g., when loading data for edit)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setPublished(initialData.published ?? false);
      setVideoUrl(initialData.videoUrl || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, content, published, videoUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        ></textarea>
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          Video URL (Optional)
        </label>
        <input
          type="url" // Use type="url" for better validation
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={isSubmitting}
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm font-medium text-gray-900">
          Published
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? 'Processing...' : submitButtonText}
      </button>
    </form>
  );
}