import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

interface DbProduct { id: number; name: string; stock: number }

export function OPTIONS() {
  return handleOptions()
}

function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'SKY-'
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export async function GET(request: NextRequest) {
  const db = await getClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.toUpperCase() ?? ''

  // Expire reservations past 48 hours
  await db.execute({
    sql: "UPDATE reservations SET status = 'Expired' WHERE expiresAt IS NOT NULL AND expiresAt < ? AND status = 'Active'",
    args: [new Date().toISOString()],
  })

  const rs = await db.execute({
    sql: `SELECT r.id, r.confirmationNumber, r.firstName, r.lastName, r.phoneNumber,
                 r.productId, p.name AS productName, r.reservedAt, r.expiresAt, r.status
          FROM reservations r
          LEFT JOIN products p ON p.id = r.productId
          WHERE r.status = 'Active'
            AND (? = '' OR r.confirmationNumber LIKE ?)
          ORDER BY r.reservedAt DESC`,
    args: [search, `%${search}%`],
  })

  return NextResponse.json(toObjects(rs), { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const db = await getClient()
  const { productId, firstName, lastName, phoneNumber } = await request.json()

  const product = toObject<DbProduct>(
    await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [productId] })
  )
  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404, headers: corsHeaders })
  }
  if (product.stock <= 0) {
    return NextResponse.json({ success: false, message: 'This item is sold out.' }, { headers: corsHeaders })
  }

  // Generate unique confirmation number
  let confirmationNumber = ''
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateConfirmationNumber()
    const existing = toObject(
      await db.execute({ sql: 'SELECT id FROM reservations WHERE confirmationNumber = ?', args: [candidate] })
    )
    if (!existing) { confirmationNumber = candidate; break }
  }
  if (!confirmationNumber) {
    return NextResponse.json({ success: false, message: 'Could not generate confirmation number. Try again.' }, { status: 500, headers: corsHeaders })
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
  const id = `${Date.now()}-${productId}`

  await db.batch([
    {
      sql: `INSERT INTO reservations (id, productId, userEmail, reservedAt, confirmationNumber, firstName, lastName, phoneNumber, expiresAt, status)
            VALUES (?, ?, '', ?, ?, ?, ?, ?, ?, 'Active')`,
      args: [id, productId, now.toISOString(), confirmationNumber, firstName, lastName, phoneNumber, expiresAt],
    },
    { sql: 'UPDATE products SET stock = stock - 1 WHERE id = ?', args: [productId] },
  ], 'write')

  return NextResponse.json({
    success: true,
    confirmationNumber,
    productName: product.name,
    expiresAt,
  }, { headers: corsHeaders })
}
