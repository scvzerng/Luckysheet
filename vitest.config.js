import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/function/func/**/*.js'],
      exclude: ['src/function/func/index.js'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
