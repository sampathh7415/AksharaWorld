import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['fs', 'crypto'],
  webpack: (config, { isServer, nextRuntime }) => {
    if (isServer && nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
      }
    }
    return config
  }
};

export default nextConfig;
