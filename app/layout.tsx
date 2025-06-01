// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/Navbar'; // Import your new Navbar component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex flex-col min-h-screen"> {/* Added flex utilities */}
          <Navbar /> {/* Render the Navbar here */}
          <main className="flex-grow"> {/* Added flex-grow to push footer down if you add one later */}
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}