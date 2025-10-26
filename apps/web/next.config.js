/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/api', '@repo/db', '@repo/ui'],
};

export default nextConfig;
