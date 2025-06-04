/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'my-blog-images-2025.s3.us-east-2.amazonaws.com',
      // Add any other image domains you might use in the future here
    ],
  },
};

module.exports = nextConfig;
