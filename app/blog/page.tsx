// src/app/blog/page.tsx
// This component displays a list of all blog posts
import { PrismaClient } from '@prisma/client';
import Link from 'next/link'; // Import Link for client-side navigation
import { auth } from '@clerk/nextjs/server'; // Import auth from Clerk

import SanitizedHtmlDisplay from '@/components/SanitizedHtmlDisplay';

const prisma = new PrismaClient();

// Function to fetch all published posts
async function getAllPosts() {
  const posts = await prisma.post.findMany({
    where: { published: true }, // Only fetch published posts
    orderBy: { createdAt: 'desc' }, // Order by creation date, newest first
    select: { // Select only the fields needed for the list display
      id: true,
      title: true,
      content: true, // We'll take a snippet of content
      createdAt: true,
    },
  });
  return posts;
}

export default async function BlogListPage() {
  const posts = await getAllPosts();
  const { userId } = await auth(); // Get the authenticated user's ID

  // Determine if a user is logged in
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            All Blog Posts
          </h1>
          {/* Create New Post Button (visible only if logged in) */}
          {isLoggedIn && (
            <Link
              href="/admin/posts/new" // Adjust this path if your new post page is different
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Post
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-600">No blog posts found. {isLoggedIn && "Click 'Create New Post' to add one!"}</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <Link href={`/blog/${post.id}`} className="block hover:underline">
                  <h2 className="text-2xl font-bold text-blue-600 hover:text-blue-800 mb-2">
                    {post.title}
                  </h2>
                </Link>
                <SanitizedHtmlDisplay
                  html={post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                />
                <p className="text-gray-500 text-sm mt-3">
                  Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}