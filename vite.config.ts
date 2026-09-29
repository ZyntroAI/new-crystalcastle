import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // ✅ เปิด React Compiler อัตโนมัติ
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', { target: '19' }]
        ]
      }
    })
  ],
  build: {
    target: 'esnext', // ✅ ให้สิทธิ์ใช้ Syntax ล่าสุด → เล็กเร็ว
    minify: 'terser', // ✅ บีบอัดดีกว่า esbuild
    sourcemap: false, // ✅ ปิดใน Production → เร็วขึ้น
    reportCompressedSize: false, // ✅ ข้ามคำนวณ → Build เร็วขึ้น
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        // ✅ แยก Vendor ออกจาก App → Cache ดีกว่า
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion']
        }
      }
    }
  },
  // ✅ Cache ทุกอย่างเพื่อ HMR เร็ว
  server: {
    hmr: { overlay: false },
    watch: { usePolling: false }
  }
})