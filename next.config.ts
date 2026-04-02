import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://codophile-v2-bucket.s3.ap-south-1.amazonaws.com/sitemap.xml',
      },
    ];
  },
};

export default nextConfig;