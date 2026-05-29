import { defineConfig } from 'vite'
import { resolve } from 'path'
import inject from '@rollup/plugin-inject'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      !isDev && inject({
        include: ['**/*.js', '**/*.ts'],
        exclude: ['**/*.css', '**/*.min.js', '**/src/index.js', '**/src/jquery-bridge.js', '**/src/jquery-init.js', '**/src/controllers/keyboard.js'],
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
    ].filter(Boolean),

    resolve: {
      alias: isDev ? {
        '@': resolve(__dirname, 'src'),
        jquery: resolve(__dirname, 'src/jquery-bridge.js'),
      } : {
        '@': resolve(__dirname, 'src'),
      },
    },

    optimizeDeps: {
      include: [],
    },

    css: {
      devSourcemap: true,
    },

    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'luckysheet',
        formats: ['es', 'umd'],
        fileName: (format) => `luckysheet.${format}.js`,
      },

      rollupOptions: {
        external: ['jquery'],
        output: {
          globals: {
            jquery: 'jQuery',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'style.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
          exports: 'named',
        },
      },

      target: 'es2015',
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
      port: 3000,
      open: true,
      cors: true,
    },

    preview: {
      port: 4000,
      open: true,
    },
  }
})
