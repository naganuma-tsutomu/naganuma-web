import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers.ts";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.microcms-assets.io", pathname: "/assets/**" },
      { protocol: "https", hostname: "assets.st-note.com" },
    ],
  },
};

export default nextConfig;
