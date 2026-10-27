import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pages } from './src/site'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { generatePages } from './scripts/pages'

export default defineConfig({
  appType: 'mpa',
  plugins: [
    react(),
    {
      name: 'wheelero-public-pages',
      apply: 'build',
      closeBundle: { order: 'pre', sequential: true, handler: generatePages },
    },
    {
      name: 'wheelero-static-preview',
      configurePreviewServer(server) {
        server.middlewares.use((request, response, next) => {
          const path = new URL(request.url!, 'http://preview').pathname
          if (path in pages && path !== '/404') {
            request.url = path === '/' ? '/index.html' : `${path}/index.html`
            next()
          } else if (existsSync(resolve('dist', '.' + path))) next()
          else {
            response.statusCode = 404
            response.setHeader('Content-Type', 'text/html; charset=utf-8')
            response.end(readFileSync('dist/404.html'))
          }
        })
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['wheelero.svg', 'wheelero-192.png', 'wheelero-512.png', 'wheelero-180.png'],
      manifest: {
        id: '/',
        name: 'Wheelero',
        short_name: 'Wheelero',
        lang: 'en',
        description: 'Turn little decisions into a game.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#7650cc',
        background_color: '#f8f7fc',
        icons: [
          { src: '/wheelero-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/wheelero-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/wheelero-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackAllowlist: [
          /^\/$/,
          /^\/(random-name-picker|yes-no-wheel|random-number-wheel|random-team-generator|about|privacy)\/?$/,
        ],
        globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2,wav}'],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/locales/')) return 'translations'
        },
      },
    },
  },
  server: { open: false },
  test: { include: ['src/**/*.test.ts'] },
})
