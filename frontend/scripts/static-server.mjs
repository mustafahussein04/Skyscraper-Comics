import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const port = Number(process.env.PORT ?? 5173)
const types = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
}

createServer(async (request, response) => {
  const requested = normalize(decodeURIComponent((request.url ?? '/').split('?')[0]))
  const candidate = resolve(join(root, requested === '/' ? 'index.html' : requested.slice(1)))
  const file = candidate.startsWith(root) ? candidate : join(root, 'index.html')
  try {
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    response.end(body)
  } catch {
    const body = await readFile(join(root, 'index.html'))
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(body)
  }
}).listen(port, '127.0.0.1', () => console.log(`Static frontend server: http://127.0.0.1:${port}`))
