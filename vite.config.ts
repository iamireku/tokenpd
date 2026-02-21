
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  const HARDCODED_UPLINK = 'https://script.google.com/macros/s/AKfycbwGbSjJqBwwhIlzTxpAkCMvoybNCyT4kuPMk8PssGz3cc7vT6FibRpZpSGdDPilSVnCJw/exec';
  const target = env.VITE_GAS_SCRIPT_URL || env.GAS_SCRIPT_URL || HARDCODED_UPLINK;

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 800, // Increase limit slightly for professional utility build
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('react')) return 'vendor-core';
              return 'vendor-ext';
            }
          }
        }
      }
    },
    server: {
      proxy: {
        '/api/proxy': {
          target: target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
          followRedirects: true
        }
      }
    }
  };
});
