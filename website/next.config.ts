import type { NextConfig } from "next";
import { SITE_URL } from "./lib/site";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mail-markdown\\.vercel\\.app" }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
      { source: "/", destination: "/en", permanent: true },
      { source: "/privacy", destination: "/en/privacy", permanent: true },
      { source: "/legal-notice", destination: "/en/legal-notice", permanent: true },
      { source: "/datenschutz", destination: "/de/privacy", permanent: true },
      { source: "/impressum", destination: "/de/legal-notice", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
