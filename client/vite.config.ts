import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
