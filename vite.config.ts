import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    // host: '0.0.0.0',
    // port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // Strip Cookie header agar Laravel tidak mencoba update tabel sessions
        // dengan user_id UUID (kolom sessions.user_id bertipe unsignedBigInteger → crash 500)
        // API menggunakan Bearer Token, bukan session/cookie auth
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Hapus Cookie agar Laravel tidak coba update tabel sessions
            // (sessions.user_id bertipe BIGINT tapi user pakai UUID → crash 500)
            proxyReq.removeHeader('Cookie')
            proxyReq.removeHeader('cookie')
            // Hapus Origin & Referer agar Sanctum EnsureFrontendRequestsAreStateful
            // tidak mendeteksi localhost:5173 sebagai stateful domain.
            // Tanpa ini: Str::startsWith('localhost:5173', 'localhost') = true
            // → Sanctum wajibkan CSRF token → 419 CSRF Token Mismatch
            // Dengan ini: request dianggap pure API (Bearer token), tidak perlu CSRF
            proxyReq.removeHeader('Origin')
            proxyReq.removeHeader('origin')
            proxyReq.removeHeader('Referer')
            proxyReq.removeHeader('referer')
          })
        },
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum/csrf-cookie': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
})
