import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove dangerous ignoreBuildErrors setting for production readiness
  env: {
    NEXT_PUBLIC_DEPLOYMENT_DATE: new Date().toISOString(),
  },
};

export default nextConfig;
