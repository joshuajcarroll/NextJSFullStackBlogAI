// src/app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server'; // Import auth from Clerk

import SanitizedHtmlDisplay from '@/components/SanitizedHtmlDisplay';
import VideoEmbed from '@/components/VideoEmbed';

const prisma = new PrismaClient();

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { id: true },
  });
  return posts.map(post => ({
    slug: post.id,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { userId } = await auth(); // Get the authenticated user's ID

  const postId = params.slug;

  const post = await prisma.post.findUnique({
    where: { id: postId, published: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          clerkId: true, // IMPORTANT: Select the author's clerkId
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Determine if the current user is the author
  const isAuthor = userId && post.author.clerkId === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
        {/* Post Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center leading-tight">
          {post.title}
        </h1>

        {/* Author and Date */}
        <div className="text-gray-600 text-sm mb-8 text-center">
          <p>
            By <span className="font-semibold text-blue-600">{post.author.name}</span> on{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Edit Post Button (visible only to author) */}
        {isAuthor && (
          <div className="text-center mb-8">
            <Link
              href={`/admin/posts/${post.id}/edit`} // Adjust this path if your edit page is different
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Edit Post
            </Link>
          </div>
        )}

        {/* Main Post Content - Rendered via the client component */}
        <SanitizedHtmlDisplay html={post.content} />

        {/* Optional Video Embed */}
        {post.videoUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Video</h2>
            <VideoEmbed videoUrl={post.videoUrl} />
          </div>
        )}

        {/* Back to Posts Button */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}