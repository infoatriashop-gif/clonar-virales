import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
  serverExternalPackages: ["child_process", "fs"],
};

export default nextConfig;
