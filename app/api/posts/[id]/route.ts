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

// GET /api/posts/[id] - Fetch a single post by ID (unchanged)
export async function GET(request: Request, context: Context) {
  try {
    const postId = context.params.id;

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
    const postId = context.params.id;
    const { title, content, published } = await req.json();

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
      USE_PROFILES: { html: true } // Keep a basic HTML profile
    });
    // --- END SANITIZATION ---

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: sanitizedContent, // Use the sanitized content
        published: published ?? postToUpdate.published,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post by ID (unchanged)
export async function DELETE(request: Request, context: Context) {
  try {
    const { userId } = await auth();
    const postId = context.params.id;

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