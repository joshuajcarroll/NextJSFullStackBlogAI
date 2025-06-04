'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce'; // Import useDebounce

interface BlogSearchInputProps {
  initialQuery?: string;
}

export default function BlogSearchInput({ initialQuery = '' }: BlogSearchInputProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Debounce for 500ms (half a second)

  // This effect runs whenever the debounced search term changes.
  useEffect(() => {
    // Create a new URLSearchParams object from the current window location.
    // This allows us to easily add/remove/update query parameters.
    const params = new URLSearchParams(window.location.search);

    if (debouncedSearchTerm) {
      params.set('q', debouncedSearchTerm); // Set the 'q' parameter with the debounced term
    } else {
      params.delete('q'); // If the search term is empty, remove the 'q' parameter from the URL
    }

    // Navigate to the new URL with the updated search parameters.
    // This push will trigger a re-render of the BlogListPage (Server Component) with new searchParams.
    router.push(`?${params.toString()}`);
  }, [debouncedSearchTerm, router]); // Dependencies: only run when debouncedSearchTerm or router changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Update local state immediately as user types
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search blog posts by title or content..."
        value={searchTerm} // Controlled component: input value is tied to state
        onChange={handleChange} // Update state on every input change
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {/* Simple search icon */}
        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}