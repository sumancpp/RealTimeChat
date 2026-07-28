import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
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