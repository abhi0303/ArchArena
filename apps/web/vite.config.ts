/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const API_TARGET = process.env.VITE_API_PROXY ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'offline.html'],
      manifest: {
        id: '/',
        name: 'HLD Arena — System Design Playground',
        short_name: 'HLD Arena',
        description: 'Learn high-level system design by building architectures on an interactive canvas and getting explainable feedback.',
        theme_color: '#4f46e5',
        background_color: '#0b1020',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'any',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Long-press the app icon (Android / desktop) to jump straight to a section.
        shortcuts: [
          { name: 'Challenges', short_name: 'Challenges', url: '/challenges', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
          { name: 'Learn the building blocks', short_name: 'Learn', url: '/learn', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
          { name: 'Dashboard', short_name: 'Dashboard', url: '/dashboard', icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }] },
        ],
        // Shown in the richer install dialog on Android and desktop Chrome.
        screenshots: [
          { src: 'screenshots/learn-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Learn every system design building block' },
          { src: 'screenshots/guide-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Before-and-after illustrations for each component' },
          { src: 'screenshots/learn-narrow.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Guides in English and Hinglish' },
          { src: 'screenshots/compare-narrow.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Side-by-side comparisons of look-alike components' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        // Install-dialog screenshots are never needed offline.
        globIgnores: ['screenshots/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false, type: 'module' },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: false },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: false },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          flow: ['@xyflow/react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    alias: { 'virtual:pwa-register/react': path.resolve(__dirname, 'test/mocks/pwa-register.ts') },
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
