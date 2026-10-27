const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { createClient } = require('@libsql/client')
const { NextRequest } = require('next/server')

const backend = path.resolve(__dirname, '..')
const modules = new Map()
// Load the application's TypeScript and @/ aliases without adding a test dependency.
function loadTS(filename) {
  if (modules.has(filename)) return modules.get(filename).exports
  const mod = new Module(filename, module)
  modules.set(filename, mod)
  const nativeRequire = Module.createRequire(filename)
  mod.require = name => name.startsWith('@/')
    ? loadTS(path.join(backend, `${name.slice(2)}.ts`))
    : nativeRequire(name)
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  })
  mod._compile(outputText, filename)
  return mod.exports
}

test('frontend and backend accept only optional absolute HTTP(S) registration links', () => {
  for (const filename of [
    path.join(backend, 'lib/registrationLink.ts'),
    path.join(backend, '../frontend/src/utils/registrationLink.ts'),
  ]) {
    const { isValidRegistrationLink } = loadTS(filename)
    for (const value of ['', 'http://example.com', 'https://example.com/register?a=1#signup']) {
      assert.equal(isValidRegistrationLink(value), true, value)
    }
    for (const value of [undefined, null, 42, {}, 'example.com', '/register', '//example.com',
      'javascript:alert(1)', 'ftp://example.com', 'https://', 'https:///','https://bad host.com',
      ' https://example.com', 'https://example.com/a b']) {
      assert.equal(isValidRegistrationLink(value), false, String(value))
    }
  }
})

test('legacy database migration and event registration API persistence', async () => {
  const originalCwd = process.cwd()
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skyscraper-events-'))
  fs.mkdirSync(path.join(fixture, 'data'))
  process.chdir(fixture)
  let db
  try {
    // Begin with the schema shipped before registration links existed.
    const legacy = createClient({ url: `file:${path.join(fixture, 'data/skyscraper.db')}` })
    await legacy.executeMultiple(`
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '', time TEXT NOT NULL DEFAULT '',
        game TEXT NOT NULL DEFAULT '', capacity TEXT NOT NULL DEFAULT '',
        entryFee TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT ''
      );
      INSERT INTO events (title, date) VALUES ('Legacy event', '2026-12-01');
    `)
    legacy.close()

    const database = loadTS(path.join(backend, 'lib/db.ts'))
    db = await database.getClient()
    const collection = loadTS(path.join(backend, 'app/api/events/route.ts'))
    const detail = loadTS(path.join(backend, 'app/api/events/[id]/route.ts'))
    const legacyEvents = await (await collection.GET()).json()
    assert.equal(legacyEvents[0].title, 'Legacy event')
    assert.equal(legacyEvents[0].registrationLink, '')

    const request = (method, body) => new NextRequest('http://localhost/api/events', {
      method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
    })
    const event = { title: 'Tournament', date: '2026-12-02' }
    const link = 'https://example.com/register?event=42'
    const createdResponse = await collection.POST(request('POST', { ...event, registrationLink: link }))
    assert.equal(createdResponse.status, 201)
    const created = await createdResponse.json()
    assert.equal(created.registrationLink, link)
    const context = { params: { id: String(created.id) } }
    assert.equal((await (await detail.GET(null, context)).json()).registrationLink, link)

    const changedLink = 'http://example.com/updated'
    const updated = await detail.PUT(request('PUT', { ...event, registrationLink: changedLink }), context)
    assert.equal(updated.status, 200)
    assert.equal((await updated.json()).registrationLink, changedLink)
    assert.equal((await db.execute({ sql: 'SELECT registrationLink FROM events WHERE id=?', args: [created.id] })).rows[0].registrationLink, changedLink)

    for (const invalid of ['example.com', 'javascript:alert(1)', 'https://', 42]) {
      assert.equal((await collection.POST(request('POST', { ...event, registrationLink: invalid }))).status, 400)
      assert.equal((await detail.PUT(request('PUT', { ...event, registrationLink: invalid }), context)).status, 400)
    }
    assert.equal((await (await detail.GET(null, context)).json()).registrationLink, changedLink)
    assert.equal((await (await collection.GET()).json()).length, 2)

    const cleared = await detail.PUT(request('PUT', { ...event, registrationLink: '' }), context)
    assert.equal((await cleared.json()).registrationLink, '')
    for (const registrationLink of [undefined, null]) {
      const result = await collection.POST(request('POST', { ...event, registrationLink }))
      assert.equal(result.status, 201)
      assert.equal((await result.json()).registrationLink, '')
    }

    // Re-running initialization must not add the column twice or lose data.
    delete global._dbReady
    await database.getClient()
    assert.equal((await (await collection.GET()).json()).length, 4)
  } finally {
    db?.close()
    delete global._dbReady
    delete global._dbClient
    process.chdir(originalCwd)
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})


test('new databases seed events with registration unavailable', async () => {
  const originalCwd = process.cwd()
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skyscraper-new-events-'))
  process.chdir(fixture)
  modules.clear()
  let db
  try {
    db = await loadTS(path.join(backend, 'lib/db.ts')).getClient()
    const result = await db.execute('SELECT registrationLink FROM events')
    assert.ok(result.rows.length > 0)
    assert.ok(result.rows.every(row => row.registrationLink === ''))
  } finally {
    db?.close()
    delete global._dbReady
    delete global._dbClient
    process.chdir(originalCwd)
    fs.rmSync(fixture, { recursive: true, force: true })
  }
})
