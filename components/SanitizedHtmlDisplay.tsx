// src/components/SanitizedHtmlDisplay.tsx
'use client'; // This component MUST be a client component

import React, { useEffect, useState } from 'react';
// DO NOT import DOMPurify directly here with 'import DOMPurify from 'dompurify';'
// We will use dynamic 'require' inside useEffect.

interface SanitizedHtmlDisplayProps {
  html: string;
}

const SanitizedHtmlDisplay: React.FC<SanitizedHtmlDisplayProps> = ({ html }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    // Only attempt to load and use DOMPurify if we are in the browser
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import DOMPurify using import(). This works with ESM and avoids require().
        import('dompurify')
          .then((mod) => {
            const dompurify = mod.default || mod;
            if (dompurify && typeof dompurify.sanitize === 'function') {
              setSanitizedHtml(dompurify.sanitize(html));
            } else {
              // Fallback if DOMPurify is not loaded as expected.
              // IMPORTANT: This means HTML is not sanitized. Only do this if you have server-side
              // sanitization as the primary defense (which you do!).
              console.error("DOMPurify.sanitize is not correctly loaded on the client. Rendering potentially unsafe HTML.", dompurify);
              setSanitizedHtml(html); // FALLBACK: Render raw HTML (UNSAFE if no server-side sanitization)
            }
          })
          .catch((error) => {
            console.error("Error loading or using DOMPurify:", error);
            setSanitizedHtml(html); // FALLBACK: Render raw HTML on error (UNSAFE)
          });
      } catch (error) {
        console.error("Error loading or using DOMPurify:", error);
        setSanitizedHtml(html); // FALLBACK: Render raw HTML on error (UNSAFE)
      }
    } else {
      // If running on the server (which shouldn't happen for a 'use client' component with useEffect, but for safety)
      setSanitizedHtml(html); // Pass raw HTML through, relying on server-side sanitization
    }
  }, [html]); // Re-run effect if HTML content changes

  // Optional: Display a loading message while DOMPurify processes on the client
  if (sanitizedHtml === '') {
    return <div className="text-gray-500">Loading content...</div>;
  }

  return (
    <div
      className="prose prose-blue max-w-none mb-10 text-gray-800 leading-relaxed break-words"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SanitizedHtmlDisplay;