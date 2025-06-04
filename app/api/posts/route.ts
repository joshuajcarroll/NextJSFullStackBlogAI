// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client'; // <--- MODIFIED: Import Prisma
import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Import JSDOM and DOMPurify for server-side HTML sanitization
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Initialize DOMPurify with a JSDOM window environment
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const prisma = new PrismaClient();

// POST /api/posts - Create a new post (unchanged)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { title, content, videoUrl, imageUrl } = await req.json();
    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }
    const sanitizedContent = purify.sanitize(content, { USE_PROFILES: { html: true } });
    let userInDb = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!userInDb) {
      const clerkUser = await currentUser();
      const userNameToUse = clerkUser?.firstName || clerkUser?.username || clerkUser?.emailAddresses[0]?.emailAddress || `Clerk User ${userId.substring(0, 5)}`;
      userInDb = await prisma.user.create({
        data: { clerkId: userId, email: clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@example.com`, name: userNameToUse, password: 'NOT_APPLICABLE_CLERK_MANAGED' },
      });
    }
    const post = await prisma.post.create({
      data: { title, content: sanitizedContent, authorId: userInDb.id, published: true, videoUrl: videoUrl || null, imageUrl: imageUrl || null },
    });
    revalidatePath(`/blog/${post.id}`);
    revalidatePath('/blog');
    revalidatePath('/');
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET /api/posts - Fetch all posts (now with corrected type for whereClause)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    // --- MODIFIED: Use Prisma.PostWhereInput type ---
    const whereClause: Prisma.PostWhereInput = {
      published: true,
    };

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } }, // `as const` is no longer needed with proper typing
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post by ID (unchanged)
// (Your existing PUT method should go here)

// DELETE /api/posts/[id] - Delete a post by ID (unchanged)
// (Your existing DELETE method should go here)