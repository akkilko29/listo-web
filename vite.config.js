import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = String(
    env.VITE_API_BASE_URL || "http://localhost:8080"
  ).replace(/\/$/, "");

  return {
    plugins: [
      react({
        include: /\.(js|jsx|ts|tsx)$/,
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
        "/uploads": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
