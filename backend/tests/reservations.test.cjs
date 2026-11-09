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

  mod.require = name =>
    name.startsWith('@/')
      ? loadTS(path.join(backend, `${name.slice(2)}.ts`))
      : nativeRequire(name)

  const { outputText } = ts.transpileModule(
    fs.readFileSync(filename, 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
      fileName: filename,
    },
  )

  mod._compile(outputText, filename)
  return mod.exports
}

async function setupFixture() {
  const fixture = fs.mkdtempSync(
    path.join(os.tmpdir(), 'skyscraper-reservations-'),
  )

  fs.mkdirSync(path.join(fixture, 'data'))

  const db = createClient({
    url: `file:${path.join(fixture, 'data/skyscraper.db')}`,
  })

  await db.executeMultiple(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      time TEXT NOT NULL DEFAULT '',
      game TEXT NOT NULL DEFAULT '',
      capacity TEXT NOT NULL DEFAULT '',
      entryFee TEXT NOT NULL DEFAULT '',
      registrationLink TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE reservations (
      id TEXT PRIMARY KEY,
      productId INTEGER NOT NULL,
      userEmail TEXT NOT NULL DEFAULT '',
      reservedAt TEXT NOT NULL,
      confirmationNumber TEXT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      expiresAt TEXT,
      status TEXT DEFAULT 'Active',
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `)

  const ins = `
    INSERT INTO products
      (name, price, type, brand, stock, description, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  await db.batch(
    [
      {
        sql: ins,
        args: [
          'Amazing Spider-Man #50',
          4.99,
          'comics',
          'Marvel',
          3,
          'Classic Spider-Man issue.',
          '/images/spiderman.jpg',
        ],
      },
      {
        sql: ins,
        args: [
          'Sold Out Comic',
          9.99,
          'comics',
          'Image',
          0,
          'A sold-out comic.',
          '/images/soldout.jpg',
        ],
      },
    ],
    'write',
  )

  db.close()
  return fixture
}

function cleanup(fixture) {
  delete global._dbReady
  delete global._dbClient
  modules.clear()

  try {
    fs.rmSync(fixture, {
      recursive: true,
      force: true,
    })
  } catch {
    // WAL lock on Windows — OS cleans up temp directory.
  }
}

function jsonPost(url, body) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

// ── Reservation creation ─────────────────────────────────────────────────────

test(
  'POST /api/reservations creates a reservation, returns SKY confirmation, expires in 48 hours, and decrements stock',
  async () => {
    const originalCwd = process.cwd()
    const fixture = await setupFixture()

    process.chdir(fixture)

    try {
      const reservations = loadTS(
        path.join(backend, 'app/api/reservations/route.ts'),
      )

      const products = loadTS(
        path.join(backend, 'app/api/products/[id]/route.ts'),
      )

      // Verify stock before reservation.
      const beforeRes = await products.GET(null, {
        params: { id: '1' },
      })

      assert.equal(beforeRes.status, 200)

      const before = await beforeRes.json()
      assert.equal(before.stock, 3)

      const startedAt = Date.now()

      const res = await reservations.POST(
        jsonPost('http://localhost/api/reservations', {
          productId: 1,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '9165551234',
        }),
      )

      const completedAt = Date.now()

      assert.equal(res.status, 200)

      const body = await res.json()

      assert.equal(body.success, true)

      assert.match(
        body.confirmationNumber,
        /^SKY-[A-Z0-9]{6}$/,
      )

      assert.equal(
        body.productName,
        'Amazing Spider-Man #50',
      )

      // Verify the expiration timestamp is 48 hours from creation.
      const expiresAt = new Date(body.expiresAt).getTime()

      assert.ok(
        Number.isFinite(expiresAt),
        'expiresAt must be a valid ISO date',
      )

      const expectedMs = 48 * 60 * 60 * 1000

      assert.ok(
        expiresAt >= startedAt + expectedMs &&
          expiresAt <= completedAt + expectedMs,
        'expiresAt must be exactly 48 hours after reservation creation',
      )

      // Verify stock decreased exactly once.
      const afterRes = await products.GET(null, {
        params: { id: '1' },
      })

      assert.equal(afterRes.status, 200)

      const after = await afterRes.json()

      assert.equal(
        after.stock,
        2,
        'successful reservation must decrement stock by exactly 1',
      )

      // Verify the reservation can be found by its confirmation number.
      const searchRes = await reservations.GET(
        new NextRequest(
          `http://localhost/api/reservations?search=${encodeURIComponent(
            body.confirmationNumber,
          )}`,
        ),
      )

      assert.equal(searchRes.status, 200)

      const matches = await searchRes.json()

      assert.equal(
        matches.length,
        1,
        'new reservation must be searchable by confirmation number',
      )

      assert.equal(
        matches[0].confirmationNumber,
        body.confirmationNumber,
      )

      assert.equal(matches[0].firstName, 'John')
      assert.equal(matches[0].lastName, 'Doe')
      assert.equal(matches[0].phoneNumber, '9165551234')

      assert.equal(
        matches[0].productName,
        'Amazing Spider-Man #50',
      )

      assert.equal(matches[0].status, 'Active')
    } finally {
      process.chdir(originalCwd)
      cleanup(fixture)
    }
  },
)

// ── Sold-out handling ────────────────────────────────────────────────────────

test(
  'POST /api/reservations returns sold-out message and does not create a reservation when stock is 0',
  async () => {
    const originalCwd = process.cwd()
    const fixture = await setupFixture()

    process.chdir(fixture)

    try {
      const reservations = loadTS(
        path.join(backend, 'app/api/reservations/route.ts'),
      )

      const products = loadTS(
        path.join(backend, 'app/api/products/[id]/route.ts'),
      )

      const res = await reservations.POST(
        jsonPost('http://localhost/api/reservations', {
          productId: 2,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '9165551234',
        }),
      )

      // Match the current backend route behavior.
      assert.equal(res.status, 200)

      const body = await res.json()

      assert.equal(body.success, false)
      assert.equal(body.message, 'This item is sold out.')

      // Stock should remain zero.
      const productRes = await products.GET(null, {
        params: { id: '2' },
      })

      assert.equal(productRes.status, 200)

      const product = await productRes.json()

      assert.equal(
        product.stock,
        0,
        'sold-out reservation attempt must not change stock',
      )

      // No reservation should have been inserted.
      const allRes = await reservations.GET(
        new NextRequest(
          'http://localhost/api/reservations',
        ),
      )

      assert.equal(allRes.status, 200)

      const all = await allRes.json()

      assert.equal(
        all.length,
        0,
        'sold-out reservation attempt must not create a reservation',
      )
    } finally {
      process.chdir(originalCwd)
      cleanup(fixture)
    }
  },
)

// ── Invalid product ──────────────────────────────────────────────────────────

test(
  'POST /api/reservations returns 404 for a non-existent product',
  async () => {
    const originalCwd = process.cwd()
    const fixture = await setupFixture()

    process.chdir(fixture)

    try {
      const { POST } = loadTS(
        path.join(backend, 'app/api/reservations/route.ts'),
      )

      const res = await POST(
        jsonPost('http://localhost/api/reservations', {
          productId: 99999,
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '9165551234',
        }),
      )

      assert.equal(res.status, 404)

      const body = await res.json()

      assert.equal(body.success, false)
      assert.equal(body.message, 'Product not found.')
    } finally {
      process.chdir(originalCwd)
      cleanup(fixture)
    }
  },
)