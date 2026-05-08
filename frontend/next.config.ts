import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Use environment variable or fallback to Render URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
'https://zenzap-backend.onrender.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    domains: ['localhost', 'zenzap-backend.onrender.com'],
  },
};

export default nextConfig;
