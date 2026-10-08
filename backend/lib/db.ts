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

async function seed(): Promise<void> {
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
      image TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      productId INTEGER NOT NULL,
      userEmail TEXT NOT NULL,
      reservedAt TEXT NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );
  `)

  const pc = await client.execute('SELECT COUNT(*) as count FROM products')
  if ((pc.rows[0][0] as number) === 0) {
    const ins = 'INSERT INTO products (name, price, type, brand, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
    await client.batch([
      { sql: ins, args: ['Amazing Spider-Man #50', 4.99, 'comics', 'Marvel', 25, 'Classic Spider-Man issue.', '/images/spiderman.jpg'] },
      { sql: ins, args: ['Batman: The Dark Knight Returns', 14.99, 'comics', 'DC', 4, 'Classic Batman issue.', '/images/batman.jpg'] },
      { sql: ins, args: ['A really long name for a product that you should buy right now', 249.99, 'comics', 'Marvel', 0, 'The most important comic book in the history of comics.', '/images/doesnt-exist.jpg'] },
      { sql: ins, args: ['Hellboy #1', 4.99, 'comics', 'Dark Horse', 0, 'A classic issue of Hellboy.', '/images/hellboy-1.jpg'] },
      { sql: ins, args: ['Blue-Eyes White Dragon', 64.99, 'tcg', 'Yu-Gi-Oh!', 1, 'A classic card from Yu-Gi-Oh!.', '/images/blue-eyes-white-dragon.jpg'] },
      { sql: ins, args: ['Charizard', 64.99, 'tcg', 'Pokemon', 1, 'A classic card from Pokemon.', '/images/charizard.jpg'] },
    ], 'write')
  }

  const ec = await client.execute('SELECT COUNT(*) as count FROM events')
  if ((ec.rows[0][0] as number) === 0) {
    const ins = 'INSERT INTO events (title, description, date, category, time, game, capacity, entryFee, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    await client.batch([
      { sql: ins, args: ['Magic Commander Night', 'Standard format tournament with prizes for top finishers.', '2026-10-15', 'Tournament', '7:00 PM - 10:00 PM', 'Magic: The Gathering', '32 players', '$5', ''] },
      { sql: ins, args: ['Pokemon League', 'Casual Pokemon play for all skill levels. Bring your own deck!', '2026-10-18', 'Casual Play', '2:00 PM - 5:00 PM', 'Pokemon TCG', '20 players', 'Free', ''] },
      { sql: ins, args: ["Yu-Gi-Oh! Regional Qualifier", 'Regional qualifier tournament for competitive players.', '2026-10-25', 'Tournament', '12:00 PM - 8:00 PM', "Yu-Gi-Oh!", '64 players', '$20', ''] },
      { sql: ins, args: ['Board Game Open Night', 'Try new arrivals from the shelf or bring your own. All are welcome.', '2026-10-30', 'Casual Play', '5:00 PM - 9:00 PM', 'Board Games', '40 players', 'Free', ''] },
    ], 'write')
  }
}

// Lazily initialize once; reuse the same promise on hot reloads
function getReadyPromise(): Promise<void> {
  if (!global._dbReady) global._dbReady = seed()
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
