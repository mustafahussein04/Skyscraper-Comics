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

async function setupFixture() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'skyscraper-products-'))
  fs.mkdirSync(path.join(fixture, 'data'))
  const db = createClient({ url: `file:${path.join(fixture, 'data/skyscraper.db')}` })
  await db.executeMultiple(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, price REAL NOT NULL, type TEXT NOT NULL,
      brand TEXT NOT NULL, stock INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '', time TEXT NOT NULL DEFAULT '',
      game TEXT NOT NULL DEFAULT '', capacity TEXT NOT NULL DEFAULT '',
      entryFee TEXT NOT NULL DEFAULT '', registrationLink TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE reservations (
      id TEXT PRIMARY KEY, productId INTEGER NOT NULL,
      userEmail TEXT NOT NULL DEFAULT '', reservedAt TEXT NOT NULL,
      confirmationNumber TEXT, firstName TEXT, lastName TEXT,
      phoneNumber TEXT, expiresAt TEXT, status TEXT DEFAULT 'Active',
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `)
  const ins = 'INSERT INTO products (name, price, type, brand, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
  await db.batch([
    { sql: ins, args: ['Amazing Spider-Man #50',       4.99,  'comics', 'Marvel',    25, 'Classic Spider-Man issue.',      '/images/spiderman.jpg'] },
    { sql: ins, args: ['Batman: The Dark Knight Returns', 14.99, 'comics', 'DC',      4,  'Classic Batman graphic novel.',  '/images/batman.jpg']    },
    { sql: ins, args: ['Sold Out Comic',                9.99,  'comics', 'Image',    0,  'A sold-out Image Comics issue.', '/images/soldout.jpg']   },
    { sql: ins, args: ['Blue-Eyes White Dragon',       64.99, 'tcg',    'Yu-Gi-Oh!', 1, 'Iconic Yu-Gi-Oh! card.',         '/images/blue-eyes.jpg'] },
    { sql: ins, args: ['Charizard Holo',               64.99, 'tcg',    'Pokemon',   5, 'Classic holo Charizard card.',   '/images/charizard.jpg'] },
  ], 'write')
  db.close()
  return fixture
}

function cleanup(fixture) {
  delete global._dbReady
  delete global._dbClient
  modules.clear()
  try { fs.rmSync(fixture, { recursive: true, force: true }) } catch { /* WAL lock on Windows — OS cleans up temp dir */ }
}

// ── Collection endpoint ───────────────────────────────────────────────────────

test('GET /api/products returns all products with required fields', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const { GET } = loadTS(path.join(backend, 'app/api/products/route.ts'))
    const res = await GET(new NextRequest('http://localhost/api/products'))
    assert.equal(res.status, 200)
    const products = await res.json()
    assert.equal(products.length, 5, 'should return all 5 seeded products')
    for (const p of products) {
      assert.ok(typeof p.id === 'number',      'id must be a number')
      assert.ok(typeof p.name === 'string',    'name must be a string')
      assert.ok(typeof p.price === 'number',   'price must be a number')
      assert.ok(typeof p.type === 'string',    'type must be a string')
      assert.ok(typeof p.brand === 'string',   'brand must be a string')
      assert.ok(typeof p.stock === 'number',   'stock must be a number')
      assert.ok(typeof p.description === 'string', 'description must be a string')
      assert.ok(typeof p.image === 'string',   'image must be a string')
    }
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

test('GET /api/products?type=comics returns only comics', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const { GET } = loadTS(path.join(backend, 'app/api/products/route.ts'))
    const res = await GET(new NextRequest('http://localhost/api/products?type=comics'))
    assert.equal(res.status, 200)
    const products = await res.json()
    assert.equal(products.length, 3, 'should return 3 comics')
    assert.ok(products.every(p => p.type === 'comics'), 'all results must have type=comics')
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

test('GET /api/products?type=tcg returns only TCG products', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const { GET } = loadTS(path.join(backend, 'app/api/products/route.ts'))
    const res = await GET(new NextRequest('http://localhost/api/products?type=tcg'))
    assert.equal(res.status, 200)
    const products = await res.json()
    assert.equal(products.length, 2, 'should return 2 TCG products')
    assert.ok(products.every(p => p.type === 'tcg'), 'all results must have type=tcg')
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

// ── Detail endpoint ───────────────────────────────────────────────────────────

test('GET /api/products/:id returns correct data for a valid id', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const collection = loadTS(path.join(backend, 'app/api/products/route.ts'))
    const detail    = loadTS(path.join(backend, 'app/api/products/[id]/route.ts'))
    const all = await (await collection.GET(new NextRequest('http://localhost/api/products'))).json()
    const expected = all[0]

    const res = await detail.GET(null, { params: { id: String(expected.id) } })
    assert.equal(res.status, 200)
    const product = await res.json()
    assert.equal(product.id,          expected.id)
    assert.equal(product.name,        expected.name)
    assert.equal(product.price,       expected.price)
    assert.equal(product.type,        expected.type)
    assert.equal(product.brand,       expected.brand)
    assert.equal(product.stock,       expected.stock)
    assert.equal(product.description, expected.description)
    assert.equal(product.image,       expected.image)
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

test('GET /api/products/:id returns 404 for non-existent id (99999)', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const { GET } = loadTS(path.join(backend, 'app/api/products/[id]/route.ts'))
    const res = await GET(null, { params: { id: '99999' } })
    assert.equal(res.status, 404)
    const body = await res.json()
    assert.ok('error' in body, 'response body must contain an error field')
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

test('GET /api/products/:id returns 404 for non-numeric id (abc)', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const { GET } = loadTS(path.join(backend, 'app/api/products/[id]/route.ts'))
    const res = await GET(null, { params: { id: 'abc' } })
    assert.equal(res.status, 404)
    const body = await res.json()
    assert.ok('error' in body, 'response body must contain an error field')
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})

test('product with stock=0 is accessible via API and stock field equals 0', async () => {
  const originalCwd = process.cwd()
  const fixture = await setupFixture()
  process.chdir(fixture)
  try {
    const collection = loadTS(path.join(backend, 'app/api/products/route.ts'))
    const detail    = loadTS(path.join(backend, 'app/api/products/[id]/route.ts'))
    const all = await (await collection.GET(new NextRequest('http://localhost/api/products'))).json()
    const soldOut = all.find(p => p.stock === 0)
    assert.ok(soldOut, 'test data must include at least one product with stock=0')
    const res = await detail.GET(null, { params: { id: String(soldOut.id) } })
    assert.equal(res.status, 200, 'sold-out product must still be fetchable')
    const product = await res.json()
    assert.equal(product.stock, 0)
  } finally {
    process.chdir(originalCwd)
    cleanup(fixture)
  }
})
