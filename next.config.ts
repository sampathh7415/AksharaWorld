import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Webpack mode: stable across all environments including Google Drive paths.
  //    Turbopack has workspace root detection issues with network/mounted drives.
  //    Using webpack ensures consistent builds locally and in GitHub Actions CI.

  // fs/crypto are Node.js built-ins; excluded from Edge Runtime automatically.
  serverExternalPackages: ['fs', 'crypto'],
};

export default nextConfig;
