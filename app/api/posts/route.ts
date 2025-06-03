// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth, currentUser } from '@clerk/nextjs/server';

// Import JSDOM and DOMPurify for server-side HTML sanitization
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Initialize DOMPurify with a JSDOM window environment
const window = new JSDOM('').window;
const purify = DOMPurify(window); // Type assertion needed for DOMPurify with JSDOM

const prisma = new PrismaClient();

// POST /api/posts - Create a new post
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    // --- SANITIZE THE CONTENT HERE ---
    const sanitizedContent = purify.sanitize(content, {
      USE_PROFILES: { html: true } // Keep a basic HTML profile
    });
    // --- END SANITIZATION ---

    let userInDb = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!userInDb) {
      const clerkUser = await currentUser();
      const userNameToUse =
        clerkUser?.firstName ||
        clerkUser?.username ||
        clerkUser?.emailAddresses[0]?.emailAddress ||
        `Clerk User ${userId.substring(0, 5)}`;

      userInDb = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@example.com`,
          name: userNameToUse,
          password: 'NOT_APPLICABLE_CLERK_MANAGED',
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: sanitizedContent, // Use the sanitized content
        authorId: userInDb.id,
        published: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/posts - Fetch all posts (unchanged)
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}