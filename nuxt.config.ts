import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2024-09-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/simple_event',
    public: {
      adminPassword: process.env.NUXT_PUBLIC_ADMIN_PASSWORD || 'admin-dialog-2024',
      schoolNames: process.env.NUXT_PUBLIC_SCHOOL_NAMES || 'SMAN 2 Bontang'
    }
  },
  ssr: {
    noExternal: ['qrcode']
  },
  vite: {
    optimizeDeps: {
      include: ['qrcode']
    }
    ,
    resolve: {
      alias: {
        '#app-manifest': path.resolve(process.cwd(), '.nuxt/dist/server/client.manifest.mjs')
      }
    }
  },
  nitro: {
    preset: 'vercel'
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
