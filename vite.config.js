import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The API URL you are trying to reach
      '/api': {
        target: 'https://cosmosodyssey.azurewebsites.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1.0/TravelPrices'),
      },
    },
  },
});
