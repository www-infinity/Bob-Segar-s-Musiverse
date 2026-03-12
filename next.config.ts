import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Bob-Segar-s-Musiverse' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
