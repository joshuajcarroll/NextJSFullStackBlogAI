// src/app/api/users/route.ts (Updated for hashed password)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// No need for argon2.hash here, as it's done on the client.
// Only argon2.verify is needed in the NextAuth.js API route.

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // We expect the password to be already hashed from the client
    const { email, name, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // The password is now expected to be the hashed string directly
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password, // Store the already hashed password
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) { // Type 'unknown' for general error handling
    console.error('Error creating user:', error);
    // Handle unique constraint violation for email
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002' &&
      'meta' in error &&
      (error as { meta?: { target?: string[] } }).meta?.target?.includes('email')
    ) {
        return NextResponse.json({ message: 'Email already registered.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}