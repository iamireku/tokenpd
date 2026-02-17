
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Property 'cwd' does not exist on type 'Process'. Use 'any' cast to access Node.js runtime environment methods in Vite config.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Updated to match the new modularized backend ID
  const HARDCODED_UPLINK = 'https://script.google.com/macros/s/AKfycbwGbSjJqBwwhIlzTxpAkCMvoybNCyT4kuPMk8PssGz3cc7vT6FibRpZpSGdDPilSVnCJw/exec';
  const target = env.VITE_GAS_SCRIPT_URL || env.GAS_SCRIPT_URL || HARDCODED_UPLINK;

  return {
    plugins: [react()],
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
