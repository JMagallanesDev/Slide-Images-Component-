import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Copias locales de las fotos de ejemplo (evita el rate-limit de Wikimedia).
      { protocol: "http", hostname: "localhost", port: "3100" },
      // Host real de las URLs que trae DEFAULT_PLACES en el componente.
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    // SOLO PARA ESTA PREVIEW: el optimizador de Next 16 bloquea por defecto los
    // hosts que resuelven a IP privada (protección SSRF), y aquí las fotos se
    // sirven desde el propio localhost:3100. No copies esto a producción.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
