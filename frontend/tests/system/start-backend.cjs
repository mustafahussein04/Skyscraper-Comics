// Run the real backend against a temporary database, without local .env files.
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')
const backend = path.resolve(__dirname, '../../../backend')
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'scrum-174-'))
for (const entry of ['app', 'lib', 'package.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.js']) {
  fs.cpSync(path.join(backend, entry), path.join(fixture, entry), { recursive: true })
}
fs.symlinkSync(path.join(backend, 'node_modules'), path.join(fixture, 'node_modules'), 'dir')
const bcrypt = require(path.join(backend, 'node_modules/bcrypt'))
const child = spawn(process.execPath, [path.join(backend, 'node_modules/next/dist/bin/next'), 'dev', '-H', '127.0.0.1', '-p', '3101'], {
  cwd: fixture,
  stdio: 'inherit',
  env: { ...process.env, FRONTEND_URL: 'http://127.0.0.1:5174', ADMIN_EMAIL: 'scrum174@example.test', ADMIN_PASSWORD_HASH: bcrypt.hashSync('SCRUM174-test-only', 4) },
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('exit', code => {
  fs.rmSync(fixture, { recursive: true, force: true })
  process.exit(code ?? 0)
})
