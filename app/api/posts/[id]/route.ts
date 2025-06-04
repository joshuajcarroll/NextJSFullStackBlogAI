// src/app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

// Import JSDOM and DOMPurify for server-side HTML sanitization
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Initialize DOMPurify with a JSDOM window environment
const window = new JSDOM('').window;
const purify = DOMPurify(window); // Type assertion needed for DOMPurify with JSDOM

const prisma = new PrismaClient();

interface Context {
  params: {
    id: string; // The post ID from the URL dynamic segment
  };
}

// GET /api/posts/[id] - Fetch a single post by ID
export async function GET(request: Request, context: Context) {
  try {
    const { id: postId } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post by ID
export async function PUT(req: Request, context: Context) {
  try {
    const { userId } = await auth();
    const { id: postId } = await context.params;
    // --- MODIFIED HERE: Rename incoming imageUrl to newImageUrl ---
    const { title, content, published, videoUrl, imageUrl: newImageUrl } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postToUpdate = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!postToUpdate) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (postToUpdate.author.clerkId !== userId) {
      return new NextResponse("Forbidden: You are not the author of this post", { status: 403 });
    }

    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    // --- SANITIZE THE CONTENT HERE ---
    const sanitizedContent = purify.sanitize(content, {
      USE_PROFILES: { html: true }
    });
    // --- END SANITIZATION ---

    const updatedData: {
      title: string;
      content: string;
      published: boolean;
      videoUrl: string | null;
      imageUrl: string | null; // This will now always be explicitly set
      updatedAt: Date;
    } = {
      title: title,
      content: sanitizedContent,
      published: published ?? postToUpdate.published,
      videoUrl: videoUrl || null,
      updatedAt: new Date(),
      imageUrl: newImageUrl !== undefined ? (newImageUrl || null) : postToUpdate.imageUrl, // Handle preserving existing image
    };

    // --- LOGIC FOR IMAGE URL PRESERVATION ---
    // if (newImageUrl !== undefined) {
    //   // If imageUrl was explicitly sent in the request, use it (can be null if cleared)
    //   updatedData.imageUrl = newImageUrl || null;
    // } else {
    //   // If imageUrl was NOT sent in the request (user didn't change it), preserve existing
    //   updatedData.imageUrl = postToUpdate.imageUrl;
    // }
    // The above explicit if/else is replaced by the cleaner ternary in updatedData initialization

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updatedData,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post by ID
export async function DELETE(request: Request, context: Context) {
  try {
    const { userId } = await auth();
    const { id: postId } = await context.params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postToDelete = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!postToDelete) {
      return new NextResponse("Post not found", { status: 404 });
    }

    if (postToDelete.author.clerkId !== userId) {
      return new NextResponse("Forbidden: You are not the author of this post", { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}