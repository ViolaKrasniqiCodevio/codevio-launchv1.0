import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.glb"],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            {
              name: 'vite-helpers',
              test: /vite[\\/](preload-helper|modulepreload-polyfill)/,
              priority: 100,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/](three|three-stdlib|@react-three|meshline|@dimforge|rapier|postprocessing|troika|@monogrid|maath|camera-controls|glsl-noise|three-mesh-bvh)[\\/]/,
              priority: 50,
            },
            {
              name: 'gsap',
              test: /node_modules[\\/]gsap[\\/]/,
              priority: 40,
            },
            {
              name: 'framer-motion',
              test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 40,
            },
            {
              name: 'ogl',
              test: /node_modules[\\/]ogl[\\/]/,
              priority: 40,
            },
            {
              name: 'router',
              test: /node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/,
              priority: 40,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 1,
            },
          ],
        },
      },
    },
  },
})
