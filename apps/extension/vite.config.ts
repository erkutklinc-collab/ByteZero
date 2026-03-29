import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getHttpsServerOptions } from 'office-addin-dev-certs'

// Fetch dev certs required for Outlook Add-ins (must be HTTPS)
async function getHttpsOptions() {
  const httpsOptions = await getHttpsServerOptions()
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert }
}

export default defineConfig(async () => {
  let httpsOptions;
  if (process.env.NODE_ENV !== 'production') {
    httpsOptions = await getHttpsOptions();
  }
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      https: httpsOptions,
      headers: {
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      }
    },
    build: {
      rollupOptions: {
        input: {
          taskpane: 'index.html',
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    }
  }
})
