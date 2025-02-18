/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "paulwesleymiracle.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
  serverActions: true, // ✅ Enable Server Actions (Only in Next.js 14+)
  logging: {
    warn: (message: string) => {
      if (message.includes("params should be awaited before using its properties")) {
        return; // ✅ Suppress warning
      }
      console.warn(message); // Allow other warnings
    }
  },
  dangerouslyAllowSVG: true, // ✅ Enable SVG images
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

};
module.exports = nextConfig;