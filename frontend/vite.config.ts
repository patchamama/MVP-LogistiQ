import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/MVP-LogistiQ/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LogistiQ - Gestión de Inventario',
        short_name: 'LogistiQ',
        description: 'Sistema de gestión de inventario con OCR',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/MVP-LogistiQ/',
        start_url: '/MVP-LogistiQ/',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23fff" width="192" height="192"/><text x="50%" y="50%" font-size="80" fill="%23000" text-anchor="middle" dominant-baseline="middle" font-weight="bold">LQ</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,eot,ttf,otf}']
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
