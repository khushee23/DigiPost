import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { spawn } from 'child_process'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function backendAutoStartPlugin() {
  let backendProc = null
  return {
    name: 'backend-auto-start',
    configureServer(server) {
      // Probe if backend is already listening on port 5000
      const req = http.get('http://127.0.0.1:5000/', (res) => {
        console.log('[DigiPost] Express backend is already online at port 5000.')
      })

      req.on('error', () => {
        console.log('[DigiPost] Port 5000 is not active. Auto-starting backend server...')
        const backendDir = path.resolve(__dirname, 'backend')
        backendProc = spawn('node', ['src/index.js'], {
          cwd: backendDir,
          stdio: 'inherit',
          shell: true,
        })

        backendProc.on('error', (err) => {
          console.error('[DigiPost] Failed to auto-start backend process:', err.message)
        })
      })

      const cleanup = () => {
        if (backendProc) {
          try {
            backendProc.kill()
          } catch {}
          backendProc = null
        }
      }

      server.httpServer?.on('close', cleanup)
      process.on('exit', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    backendAutoStartPlugin(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})

