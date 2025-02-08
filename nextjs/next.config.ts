/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // ✅ Enable Server Actions (Only in Next.js 14+)
  },
};
module.exports = nextConfig;