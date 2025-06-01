// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server'; // Import Clerk's auth helper

const prisma = new PrismaClient();

// POST /api/posts - Create a new post
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // Get the authenticated userId from Clerk

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    // Find or create the user in your Prisma database using their Clerk userId
    let userInDb = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!userInDb) {
      // If the user doesn't exist in your DB, create them.
      // You might fetch more details from Clerk's API here if needed (e.g., email, name).
      // For simplicity, we'll use a placeholder email and name if not found.
      const clerkUser = await currentUser();
      userInDb = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@example.com`,
          name: clerkUser?.firstName || 'Clerk User',
          password: 'NOT_APPLICABLE_CLERK_MANAGED', // Placeholder if password field is still required by Prisma
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userInDb.id, // Link post to your internal Prisma user ID
        published: true, // Or set to false and have an admin panel to publish
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/posts - Fetch all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true }, // Only fetch published posts
      include: { author: { select: { name: true, email: true } } }, // Include author name and email
      orderBy: { createdAt: 'desc' }, // Order by most recent
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}