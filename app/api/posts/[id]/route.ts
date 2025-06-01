// src/app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/posts/:id - Fetch a single post
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { name: true, email: true } } },
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

// PUT /api/posts/:id - Update a post
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    const { id } = params;
    const { title, content, published } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }, // Select only authorId to check ownership
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    // Find the internal user ID linked to the Clerk userId
    const userInDb = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!userInDb || post.authorId !== userInDb.id) {
      return new NextResponse("Forbidden: You do not own this post", { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? undefined, // Only update if provided
        content: content ?? undefined,
        published: published ?? undefined,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/posts/:id - Delete a post
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    const { id } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const userInDb = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!userInDb || post.authorId !== userInDb.id) {
      return new NextResponse("Forbidden: You do not own this post", { status: 403 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No content for successful deletion
  } catch (error) {
    console.error("Error deleting post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}