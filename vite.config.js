import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Assuming React
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Maps @ to src/
    },
  },
  build: {
    rollupOptions: {
      external: [], // Add any true externals here if needed (rare for client apps)
    },
  },
});