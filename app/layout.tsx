import { ClerkProvider } from '@clerk/nextjs';
import './globals.css'; // Assuming you have global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap your entire application with ClerkProvider
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}