import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Experimental features removed - require canary version
  serverExternalPackages: ['@napi-rs/canvas'],
};

export default nextConfig;
