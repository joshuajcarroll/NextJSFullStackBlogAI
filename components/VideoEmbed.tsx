// src/components/VideoEmbed.tsx
'use client'; // This needs to be a client component because it uses browser features (iframe)

import React from 'react';

interface VideoEmbedProps {
  videoUrl: string; // Now required, as we expect a URL
  title?: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ videoUrl, title = 'Embedded Video' }) => {
  if (!videoUrl) {
    return null; // Don't render anything if no video URL
  }

  let embedSrc = videoUrl; // Default to using the provided URL directly

  // Simple check and conversion for common YouTube watch URLs to embed URLs
  // Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // Becomes: https://www.youtube.com/embed/dQw4w9WgXcQ
  const youtubeWatchRegex = /(?:youtube\.com\/(?:watch\?v=|v\/)|youtu\.be\/)(\w{11})(?:\S+)?/;
  const youtubeMatch = videoUrl.match(youtubeWatchRegex);

  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    embedSrc = `https://www.youtube.com/embed/$${videoId}?rel=0&showinfo=0&iv_load_policy=3`;
  }
  // You can add similar logic for Vimeo here if desired:
  // else if (videoUrl.includes('vimeo.com')) {
  //   const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  //   if (vimeoIdMatch && vimeoIdMatch[1]) {
  //     embedSrc = `https://player.vimeo.com/video/${vimeoIdMatch[1]}`;
  //   }
  // }


  return (
    <div className="relative aspect-video w-full rounded-lg overflow-hidden my-4 shadow-lg">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={embedSrc}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default VideoEmbed;