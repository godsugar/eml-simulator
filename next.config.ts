import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/eml-simulator' : '',
  assetPrefix: isProd ? '/eml-simulator' : '',
};

export default nextConfig;
