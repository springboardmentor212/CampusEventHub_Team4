import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:5555'

  if (!env.VITE_PROXY_TARGET && env.VITE_API_URL) {
    try {
      proxyTarget = new URL(env.VITE_API_URL).origin
    } catch {
      proxyTarget = 'http://localhost:5555'
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
