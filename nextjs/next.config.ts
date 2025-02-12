/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // ✅ Enable Server Actions (Only in Next.js 14+)
    logging: {
      warn: (message: string) => {
        if (message.includes("params should be awaited before using its properties")) {
          return; // ✅ Suppress warning
        }
        console.warn(message); // Allow other warnings
      }
    }
  },
};
module.exports = nextConfig;