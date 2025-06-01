// src/app/blog/page.tsx
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function BlogPage() {
  // Fetch all published posts, including their author's name and email
  // Order them by creation date, newest first
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-12 text-center leading-tight">
        Our Latest <span className="text-blue-600">Blog Posts</span>
      </h1>

      {/* Conditional Rendering: No Posts vs. Posts Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 font-medium mb-4">No blog posts published yet.</p>
          <p className="text-gray-500">Check back soon for exciting content!</p>
          <Link
            href="/admin/posts/new"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        // Grid Layout for Blog Post Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-6 flex-grow">
                {/* Post Title */}
                <h2 className="text-2xl font-semibold mb-3 text-gray-800 leading-snug">
                  <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors duration-200">
                    {post.title}
                  </Link>
                </h2>
                {/* Author and Date */}
                <p className="text-gray-500 text-sm mb-4">
                  By <span className="font-medium text-gray-700">{post.author.name || post.author.email}</span> on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {/* Post Content Snippet */}
                <p className="text-gray-700 leading-relaxed line-clamp-4 mb-4">
                  {post.content}
                </p>
              </div>
              {/* Read More Link */}
              <div className="p-6 pt-0">
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-blue-600 hover:underline font-semibold transition-colors duration-200"
                >
                  Read More
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}