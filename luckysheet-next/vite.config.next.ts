import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),

  resolve: {
    alias: {
      '@next': resolve(__dirname, 'src'),
    },
  },

  css: {
    devSourcemap: true,
  },

  build: {
    outDir: resolve(__dirname, '..', 'dist-next'),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'luckysheetNext',
      formats: ['es', 'umd'],
      fileName: (format) => `luckysheet-next.${format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
        exports: 'named',
      },
    },
    target: 'es2020',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    cssCodeSplit: false,
  },

  server: {
    port: 3001,
    open: true,
    cors: true,
  },

  preview: {
    port: 4001,
    open: true,
  },
});
