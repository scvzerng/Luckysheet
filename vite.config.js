import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'

function copyWebfonts() {
  return {
    name: 'copy-webfonts',
    writeBundle() {
      const srcDir = 'src/webfonts'
      const destDir = 'dist/webfonts'
      
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }
      
      readdirSync(srcDir).forEach(file => {
        copyFileSync(resolve(srcDir, file), resolve(destDir, file))
        console.log('Copied webfont:', file)
      })
    }
  }
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [copyWebfonts()],

    resolve: {
      alias: {
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
        output: {
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
