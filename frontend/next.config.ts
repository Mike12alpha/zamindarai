import type { NextConfig } from "next";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${INTERNAL_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
