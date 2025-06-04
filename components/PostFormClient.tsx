// src/components/PostFormClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const TinyMCEEditor = dynamic(() => import('./TinyMCEEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface PostFormData {
  title: string;
  content: string;
  published: boolean;
  videoUrl?: string;
  imageUrl?: string;
}

interface PostFormProps {
  initialData?: PostFormData;
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
}

export default function PostFormClient({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null); // Initialized with initialData.imageUrl
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    // Revoke object URL when imagePreview changes or component unmounts
    if (imagePreview && imagePreview.startsWith('blob:')) {
      return () => {
        URL.revokeObjectURL(imagePreview);
      };
    }
  }, [imagePreview]);

  // --- MODIFIED useEffect for initialData ---
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content || '');
      setPublished(initialData.published ?? false);
      setVideoUrl(initialData.videoUrl || '');
      setImageUrl(initialData.imageUrl || null);
      setImagePreview(initialData.imageUrl || null); // Ensure imagePreview is set for existing images
    }
  }, [initialData]);
  // --- END MODIFIED useEffect ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError(null);
      setImageUrl(null); // Clear imageUrl when a new file is selected, it will be set on upload
    } else {
      setImageFile(null);
      setImagePreview(initialData?.imageUrl || null); // Revert to initial image if file cleared
      setImageUrl(initialData?.imageUrl || null); // Revert imageUrl as well
      setUploadError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setUploadError('No image selected for upload.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image to S3.');
      }

      const data = await response.json();
      const uploadedS3Url = data.imageUrl;
      setImageUrl(uploadedS3Url);
      setImagePreview(uploadedS3Url);
      alert('Image uploaded successfully! Remember to save the post.');

    } catch (error: unknown) {
      console.error('Image upload error:', error);
      if (error instanceof Error) {
        setUploadError(error.message || 'An unexpected error occurred during image upload.');
      } else {
        setUploadError('An unexpected error occurred during image upload.');
      }
      setImageUrl(initialData?.imageUrl || null); // Revert to initial URL or null on failure
      setImagePreview(initialData?.imageUrl || null); // Revert preview on failure
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingImage) {
      alert('Please wait for the image upload to complete.');
      return;
    }
    if (uploadError) {
      alert('Please resolve image upload errors before submitting.');
      return;
    }

    // Check if an image file is selected but not yet uploaded (imageUrl is null/empty AND imageFile exists)
    if (imageFile && !imageUrl) {
      alert("You've selected a new image but not uploaded it. Please click 'Upload Image' first or clear the selection.");
      return;
    }

    // Pass imageUrl as string or undefined to match PostFormData interface
    await onSubmit({
      title,
      content,
      published,
      videoUrl: videoUrl || undefined,
      imageUrl: imageUrl || undefined // Pass the current imageUrl state
    });
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
          required
          disabled={isSubmitting || isUploadingImage}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <TinyMCEEditor
          value={content}
          onEditorChange={(newValue) => setContent(newValue)}
          readOnly={isSubmitting || isUploadingImage}
        />
      </div>

      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
          Video URL (YouTube/Vimeo)
        </label>
        <input
          type="url"
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={isSubmitting || isUploadingImage}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        />
      </div>

      {/* --- IMAGE UPLOAD SECTION --- */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Featured Image (Optional)
        </label>
        <div className="mt-1 flex items-center space-x-3">
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isSubmitting || isUploadingImage}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {/* Only show upload button if a file is selected OR if there's an imagePreview from a blob but not yet uploaded to S3 */}
          {(imageFile || (imagePreview && imagePreview.startsWith('blob:'))) && (
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={isUploadingImage || isSubmitting || (!!imageUrl && !imageFile)} // Disable if already uploaded and no new file selected
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          )}
        </div>
        {(imagePreview || initialData?.imageUrl) && ( // Show preview if imagePreview exists or initialData has an image
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
            <Image
              src={imagePreview || initialData?.imageUrl || ''} // Fallback to initialData.imageUrl if imagePreview is null
              alt="Image Preview"
              width={256}
              height={256}
              className="max-h-64 object-contain rounded-md border border-gray-200"
            />
            {(imageUrl && imageUrl === imagePreview) && (
              <p className="text-xs text-green-600 mt-1">Image successfully uploaded to S3.</p>
            )}
            {/* Show "not yet uploaded" only if a new file is selected and not yet uploaded */}
            {(imageFile && imagePreview && imagePreview.startsWith('blob:') && !imageUrl) && (
              <p className="text-xs text-yellow-600 mt-1">Image selected, but not yet uploaded to S3.</p>
            )}
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                setImageUrl(null); // Crucial: Set imageUrl to null when clearing
                setUploadError(null);
              }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Clear Image
            </button>
          </div>
        )}
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="published"
          name="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          disabled={isSubmitting || isUploadingImage}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
          Published
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            isUploadingImage ||
            (!!imageFile && !imageUrl) // Disable if a file is selected but not uploaded
          }
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}