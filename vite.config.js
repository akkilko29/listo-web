import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { writeSitemap } from "./scripts/generate-sitemap.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = String(
    env.VITE_API_BASE_URL || "https://listolisting.online"
  ).replace(/\/$/, "");

  const proxy = {
    "/api": {
      target: apiOrigin,
      changeOrigin: true,
      secure: false,
    },
    "/uploads": {
      target: apiOrigin,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
      {
        name: "listo-sitemap",
        apply: "build",
        async closeBundle() {
          const target = path.resolve(process.cwd(), "dist/sitemap.xml");
          try {
            await writeSitemap(target);
            console.log(`sitemap written to ${target}`);
          } catch (error) {
            console.warn("sitemap generation skipped:", error.message);
          }
        },
      },
    ],
    server: {
      proxy,
    },
    preview: {
      proxy,
    },
  };
});
