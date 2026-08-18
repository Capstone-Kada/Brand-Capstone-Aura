import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Keep browser requests on the same origin during development. Vite
      // forwards them to the local Express API, which also works when the UI
      // is opened through a LAN address rather than localhost.
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || (env.VITE_API_URL?.startsWith('http') ? env.VITE_API_URL : 'http://localhost:3000'),
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: ['aura.technolabs.my.id'],
    },
    preview: {
      allowedHosts: ['aura.technolabs.my.id'],
    },
  };
});
