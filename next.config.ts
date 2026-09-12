import type { NextConfig } from "next";

/** @type {import("next").NextConfig} **/
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [10, 75, 50, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      { protocol: "https", hostname: "mateussilver.github.io" },
    ],
  },
};

export default nextConfig;
