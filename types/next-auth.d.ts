// src/types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name: string | null;
    email: string;
  }
}

// If you're using JWT strategy, you might also want to extend the JWT token type

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string;
  }
}