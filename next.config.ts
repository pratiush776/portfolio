import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force Turbopack root to this app directory.
    root: process.cwd(),
  },
  experimental: {
    viewTransition: true,
  },
  // Hide the dev-only "N" indicator badge (it never shipped to prod, but it clutters the landing
  // while developing / screenshotting).
  devIndicators: false,
};

export default nextConfig;
