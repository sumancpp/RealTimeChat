import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless"
    }
  },
  worker: {
    format: "es"
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024
      },
      manifest: {
        name: "BaatCheet",
        short_name: "BaatCheet",
        description: "Real-Time Chat Engine",
        theme_color: "#05070e",
        background_color: "#05070e",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/logo.jpeg",
            sizes: "192x192 512x512",
            type: "image/jpeg",
            purpose: "any maskable"
          },
          {
            src: "/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ]
});