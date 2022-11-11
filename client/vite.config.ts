import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@src', replacement: '/src' },
      { find: '@asset', replacement: '/src/asset' },
      { find: '@style', replacement: '/src/style' },
    ],
  },
});
