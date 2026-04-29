export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: { apiBase: process.env.API_BASE || 'http://localhost:8000' }
  }
})
