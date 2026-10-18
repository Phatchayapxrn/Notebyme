// ตั้งค่า Vite (ตัวรันเว็บตอนพัฒนา และตัว build เว็บจริง)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    // PWA = ทำให้เว็บติดตั้งลงหน้าจอมือถือได้เหมือนแอพ
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'patterns/*.svg'],
      manifest: {
        name: 'Idea Notes – จดไอเดีย',
        short_name: 'จดไอเดีย',
        description: 'จดไอเดียแยกหมวด + สิ่งที่ต้องทำ',
        lang: 'th',
        theme_color: '#F7F7F8',
        background_color: '#F7F7F8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // เก็บไฟล์เว็บไว้ในเครื่อง เปิดตอนไม่มีเน็ตได้ (ข้อมูลโน๊ตยังต้องใช้เน็ต)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: {
    // แยกไฟล์ใหญ่เป็นก้อนๆ เบราว์เซอร์จะเก็บไว้ใช้ซ้ำได้ เว็บเปิดเร็วขึ้น
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder', '@tiptap/extension-task-list', '@tiptap/extension-task-item'],
          database: ['@supabase/supabase-js'],
        },
      },
    },
  },
  resolve: {
    // ให้เขียน import แบบ '@/shared/...' แทน '../../../shared/...'
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
