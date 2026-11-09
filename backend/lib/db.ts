import { createClient, type Client, type ResultSet } from '@libsql/client'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

declare global {
  // eslint-disable-next-line no-var
  var _dbClient: Client | undefined
  // eslint-disable-next-line no-var
  var _dbReady: Promise<void> | undefined
}

function makeClient(): Client {
  return createClient({ url: `file:${path.join(DB_DIR, 'skyscraper.db')}` })
}

const client: Client = global._dbClient ?? makeClient()
if (process.env.NODE_ENV !== 'production') global._dbClient = client

async function initSchema(): Promise<void> {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      brand TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS events (
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
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      productId INTEGER NOT NULL,
      userEmail TEXT NOT NULL DEFAULT '',
      reservedAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `)

  // Upgrade existing databases without changing existing event data.
  const columns = await client.execute('PRAGMA table_info(events)')
  if (!columns.rows.some(column => column.name === 'registrationLink')) {
    await client.execute("ALTER TABLE events ADD COLUMN registrationLink TEXT NOT NULL DEFAULT ''")
  }
  // Migrate: add new columns if they don't exist yet
  const newCols = [
    'ALTER TABLE reservations ADD COLUMN confirmationNumber TEXT',
    'ALTER TABLE reservations ADD COLUMN firstName TEXT',
    'ALTER TABLE reservations ADD COLUMN lastName TEXT',
    'ALTER TABLE reservations ADD COLUMN phoneNumber TEXT',
    'ALTER TABLE reservations ADD COLUMN expiresAt TEXT',
    "ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'Active'",
  ]
  for (const sql of newCols) {
    try { await client.execute(sql) } catch { /* column already exists */ }
  }
  // New databases start empty: products and events are added through the admin portal.
}

// Lazily initialize once; reuse the same promise on hot reloads
function getReadyPromise(): Promise<void> {
  if (!global._dbReady) global._dbReady = initSchema()
  return global._dbReady
}

/** Call this at the top of every route handler. */
export async function getClient(): Promise<Client> {
  await getReadyPromise()
  return client
}

/** Convert a libsql ResultSet to plain objects. */
export function toObjects<T>(rs: ResultSet): T[] {
  return rs.rows.map(row =>
    Object.fromEntries(rs.columns.map((col, i) => [col, row[i]]))
  ) as T[]
}

/** Return the first row as a plain object, or undefined. */
export function toObject<T>(rs: ResultSet): T | undefined {
  if (rs.rows.length === 0) return undefined
  return Object.fromEntries(rs.columns.map((col, i) => [col, rs.rows[0][i]])) as T
}
