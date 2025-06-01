// src/app/blog/[slug]/page.tsx
import { PrismaClient } from '@prisma/client';
import VideoEmbed from '@/components/VideoEmbed'; // Import the component

const prisma = new PrismaClient();

interface PostPageProps {
  params: {
    slug: string; // Assuming 'slug' is actually the post ID for now
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const postId = params.slug; // Using slug as ID for simplicity

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Post not found. Please check the ID.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-6">By {post.author.name || post.author.email} on {new Date(post.createdAt).toLocaleDateString()}</p>

      {/* Conditionally render video if videoUrl exists */}
      {post.videoUrl && (
        <div className="mb-8">
          <VideoEmbed videoUrl={post.videoUrl} title={post.title} />
        </div>
      )}

      <div className="prose lg:prose-lg max-w-none mb-8">
        {/*
          IMPORTANT: If post.content will contain rich HTML (e.g., from an editor),
          you must use dangerouslySetInnerHTML and SANITIZE the HTML
          to prevent XSS attacks. For simple text, this is fine.
        */}
        <p>{post.content}</p>
      </div>

      {/* Add other post elements like tags, comments etc. here */}
    </div>
  );
}