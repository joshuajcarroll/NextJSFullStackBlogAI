// src/app/blog/[slug]/page.tsx
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import VideoEmbed from '@/components/VideoEmbed';

const prisma = new PrismaClient();

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Function to fetch data for the server component
export default async function PostPage({ params }: PostPageProps) {
  // Await params to ensure it's fully resolved before accessing its properties
  // This is typically not needed for 'params' directly passed, but the error suggests otherwise.
  const resolvedParams = await Promise.resolve(params); // Use Promise.resolve just to be safe
  const postId = resolvedParams.slug; // Access slug from the awaited object

  // Fetch the post and include author details
  const post = await prisma.post.findUnique({
    where: { id: postId, published: true }, // Ensure it's published
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Handle case where post is not found or not published
  if (!post) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Post Not Found</h1>
          <p className="text-gray-700 mb-6">The blog post you are looking for does not exist or has not been published yet.</p>
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:underline font-semibold"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Blog Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
        {/* Back to Blog Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 font-semibold"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Blog Posts
          </Link>
        </div>

        {/* Post Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-gray-600 text-lg mb-8 border-b pb-4">
          By <span className="font-semibold text-gray-800">{post.author.name || post.author.email}</span> on{' '}
          <time dateTime={post.createdAt.toISOString()}>
            {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </p>

        {/* Video Embed Section (if videoUrl exists) */}
        {post.videoUrl && (
          <div className="mb-10">
            <VideoEmbed videoUrl={post.videoUrl} title={post.title} />
          </div>
        )}

        {/* Post Content */}
        <div className="prose lg:prose-lg max-w-none text-gray-800 leading-relaxed">
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
}