import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    modulePreload: {
      resolveDependencies: (_url, deps) => deps.filter((dep) => !dep.includes('FinalExamSection')),
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }

          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-')) {
            return 'motion'
          }

          if (id.includes('/src/components/') || id.includes('GlossaryTerm')) {
            return 'ui'
          }

          if (id.includes('/src/courseData.ts') || id.includes('/src/glossary.ts')) {
            return 'course'
          }

          return undefined
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
