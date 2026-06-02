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

      injectRegister: "auto",

      includeAssets: [

        "logo.png",
        "icon-192.png",
        "icon-512.png"

      ],

      manifest: {

        id: "/",

        name: "BaatCheet",

        short_name: "BaatCheet",

        description:
          "Real Time Chat Application",

        start_url: "/",

        scope: "/",

        display: "standalone",

        orientation: "portrait",

        theme_color: "#f97316",

        background_color: "#ffffff",

        lang: "en",

        icons: [

          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },

          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },

          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }

        ]

      },

      workbox: {

        globPatterns: [

          "**/*.{js,css,html,png,svg,ico}"

        ],

        cleanupOutdatedCaches: true,

        clientsClaim: true,

        skipWaiting: true

      }

    })

  ]

});