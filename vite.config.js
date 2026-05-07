import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        agentesIa: resolve(__dirname, 'pages/agentes-ia.html'),
        automacao: resolve(__dirname, 'pages/automacao.html'),
        integracao: resolve(__dirname, 'pages/integracao.html'),
        landingPages: resolve(__dirname, 'pages/landing-pages.html'),
        baseConhecimento: resolve(__dirname, 'pages/base-conhecimento.html'),
        saas: resolve(__dirname, 'pages/saas.html'),
      }
    }
  }
})
