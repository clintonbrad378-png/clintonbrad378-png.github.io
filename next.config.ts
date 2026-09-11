import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Full-stack en Cloudflare Workers (OpenNext). Sin `output: export`.
  // Imágenes sin optimizar (usamos <img> directo, sin next/image).
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Cabeceras de seguridad globales
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
