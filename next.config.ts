import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove dangerous ignoreBuildErrors setting for production readiness
  env: {
    NEXT_PUBLIC_DEPLOYMENT_DATE: new Date().toISOString(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
