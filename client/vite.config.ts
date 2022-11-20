import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Minecraft 2D',
        short_name: 'Minecraft 2D',
        description: 'A Minecraft clone in 2D',
        categories: ['entertainment', 'games'],
        lang: 'en-US',
        orientation: 'landscape',
        start_url: '.',
        scope: '/',
        display: 'fullscreen',
        theme_color: '#000000',
        background_color: '#000000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@asset', replacement: '/src/asset' },
      { find: '@component', replacement: '/src/component' },
      { find: '@game', replacement: '/src/game' },
      { find: '@hook', replacement: '/src/hook' },
      { find: '@style', replacement: '/src/style' },
      { find: '@util', replacement: '/src/util' },
    ],
  },
});
