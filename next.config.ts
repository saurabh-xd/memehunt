import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
     remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgflip.com",
      },
    ]
  }
};

export default nextConfig;
