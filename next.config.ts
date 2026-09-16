import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.microcms-assets.io", pathname: "/assets/**" },
      { protocol: "https", hostname: "assets.st-note.com" },
    ],
  },
};

export default nextConfig;
