import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const proxy = { '/api': 'http://127.0.0.1:8017' }
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Γύρνα. — Μια στροφή, μια απόφαση',
        short_name: 'Γύρνα.',
        lang: 'el',
        description: 'Οι μικρές αποφάσεις γίνονται παιχνίδι.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#7650cc',
        background_color: '#f8f7fc',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
      },
    }),
  ],
  server: { proxy },
  preview: { proxy },
  test: { include: ['src/**/*.test.ts'] },
})
