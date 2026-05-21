import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force Turbopack root to this app directory.
    root: process.cwd(),
  },
};

export default nextConfig;
