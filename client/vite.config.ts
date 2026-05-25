import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Matches `php artisan serve` (default http://127.0.0.1:8000). For XAMPP instead, set VITE_DEV_API_TARGET=http://localhost and VITE_DEV_API_REWRITE=/CloresVigoBilliones/server/public
      '/api': {
        target: process.env.VITE_DEV_API_TARGET ?? 'http://127.0.0.1:8000',
        changeOrigin: true,
        ...(process.env.VITE_DEV_API_REWRITE
          ? { rewrite: (path: string) => `${process.env.VITE_DEV_API_REWRITE}${path}` }
          : {}),
      },
    },
  },
});
