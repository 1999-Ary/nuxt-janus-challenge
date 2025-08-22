// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/ui',
  ],
  typescript: {
    strict: true,
    shim: false,
  },
  nitro: {
    compatibilityDate: '2025-08-22',
  },
  runtimeConfig: {
    public: {
      janusWs: process.env.NUXT_PUBLIC_JANUS_WS || 'wss://your-janus-server/janus',
    },
  },
})
