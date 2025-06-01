// src/app/admin/posts/new/NewPostFormClient.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoEmbed from '@/components/VideoEmbed'; // Assuming this path

interface NewPostFormClientProps {
    authorId: string; // Passed from the server component
}

export default function NewPostFormClient({ authorId }: NewPostFormClientProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    videoUrl: videoUrl || null,
                    published,
                    authorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            const newPost = await response.json();
            alert('Post created successfully!');
            router.push(`/blog/${newPost.id}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
                    <input
                        type="text"
                        id="title"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
                    <textarea
                        id="content"
                        rows={10}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="videoUrl" className="block text-gray-700 text-sm font-bold mb-2">Video URL (e.g., YouTube Link):</label>
                    <input
                        type="url"
                        id="videoUrl"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Optional: https://www.youtube.com/watch?v=3Knsg3Js8jI"
                    />
                </div>
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        id="published"
                        className="mr-2 leading-tight"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                    />
                    <label htmlFor="published" className="text-sm">Publish Post</label>
                </div>
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}