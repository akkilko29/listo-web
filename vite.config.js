import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

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
    ],
    server: {
      proxy,
    },
    preview: {
      proxy,
    },
  };
});
