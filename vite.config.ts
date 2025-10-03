import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Fixed: Use environment variables instead of global defines to avoid syntax errors
  // The previous __WS_TOKEN__ pattern was causing Vite to generate malformed code
  // Environment variables are safer and don't cause string replacement issues
});
