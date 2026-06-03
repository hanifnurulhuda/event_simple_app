import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/simple_event',
    adminPassword: process.env.NUXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin-dialog-2024',
    public: {
      schoolNames: process.env.NUXT_PUBLIC_SCHOOL_NAMES || 'SMAN 2 Bontang'
    }
  },
  ssr: {
    noExternal: ['qrcode']
  },
  vite: {
    build: { sourcemap: false },
    optimizeDeps: {
      include: ['qrcode']
    },
    resolve: {
      alias: {
        '#app-manifest': path.resolve(process.cwd(), '.nuxt/dist/server/client.manifest.mjs')
      }
    }
  },
  nitro: {
    preset: 'vercel',
    future: {
      nativeSWR: true
    }
  },
  routeRules: {
    '/': { swr: 300 },
    '/register': { swr: 300 },
    '/checkin': { swr: 300 },
    '/survey': { swr: 300 },
    '/certificate': { swr: 300 },
    '/action-plan': { swr: 300 },
    '/checkin/**': { swr: 60 },
    '/survey/**': { swr: 60 },
    '/api/survey-questions': { swr: 300 },
    '/api/event-qr-codes/**': { headers: { 'cache-control': 'public, max-age=3, stale-while-revalidate=15' } },
    '/api/checkin': { headers: { 'cache-control': 'no-store' } },
    '/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/api/admin/**': { headers: { 'cache-control': 'no-store' } },
    '/api/participants/**': { headers: { 'cache-control': 'no-store' } },
    '/api/survey-responses/**': { headers: { 'cache-control': 'no-store' } },
    '/api/action-plans/**': { headers: { 'cache-control': 'no-store' } }
  },
  app: {
    head: {
      title: 'Dialog Kebangsaan',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistem MVP event Dialog Kebangsaan' }
      ]
    }
  }
})
