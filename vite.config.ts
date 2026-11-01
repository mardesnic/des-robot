import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/des-robot/',
  plugins: [
    react(),
    // Installable from the browser menu, and works offline once loaded.
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      manifest: {
        name: 'Robot',
        short_name: 'Robot',
        description: 'A path-planning puzzle game for kids that works offline',
        theme_color: '#f08a24',
        background_color: '#f4f5f7',
        display: 'standalone',
      },
    }),
  ],
});
