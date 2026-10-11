import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vercel serves /api/* in production; this mirrors it for `pnpm dev`.
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        const mod = (await server.ssrLoadModule('/api/generate.ts')) as {
          POST: (request: Request) => Promise<Response>
        }

        const response = await mod.POST(
          new Request('http://localhost/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.concat(chunks),
          }),
        )
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // 키는 저장소 맨 위의 .env에 둔다. app/.env.local이 있으면 그 값이 우선한다.
  const rootDir = path.resolve(import.meta.dirname, '..')
  Object.assign(process.env, loadEnv(mode, rootDir, ''), loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), localApi()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
