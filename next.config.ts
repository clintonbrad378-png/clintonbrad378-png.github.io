import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export 100% estático para GitHub Pages (sin servidor).
  // Las lecturas de Supabase ocurren en build (prerender) y en el
  // navegador en vivo (catálogo siempre fresco, panel admin).
  output: "export",
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
