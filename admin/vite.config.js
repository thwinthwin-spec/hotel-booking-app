import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite setup: React plugin enables JSX + fast refresh.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // avoid clashing with a client app running on 5173
    open: false,
  },
});
