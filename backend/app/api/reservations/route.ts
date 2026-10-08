import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

interface DbProduct { id: number; name: string; stock: number }

export function OPTIONS() {
  return handleOptions()
}

export async function GET(request: NextRequest) {
  const db = await getClient()
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  const rs = email
    ? await db.execute({ sql: 'SELECT * FROM reservations WHERE userEmail = ? ORDER BY reservedAt DESC', args: [email] })
    : await db.execute('SELECT * FROM reservations ORDER BY reservedAt DESC')

  return NextResponse.json(toObjects(rs), { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const db = await getClient()
  const { productId, userEmail } = await request.json()

  const product = toObject<DbProduct>(
    await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [productId] })
  )
  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found.', stock: 0 }, { status: 404, headers: corsHeaders })
  }

  const alreadyReserved = toObject(
    await db.execute({ sql: 'SELECT id FROM reservations WHERE productId = ? AND userEmail = ?', args: [productId, userEmail] })
  )
  if (alreadyReserved) {
    return NextResponse.json({ success: false, message: 'You have already reserved this item.', stock: product.stock }, { headers: corsHeaders })
  }

  if (product.stock <= 0) {
    return NextResponse.json({ success: false, message: 'This item is sold out.', stock: 0 }, { headers: corsHeaders })
  }

  await db.batch([
    { sql: 'INSERT INTO reservations (id, productId, userEmail, reservedAt) VALUES (?, ?, ?, ?)', args: [`${Date.now()}-${productId}`, productId, userEmail, new Date().toISOString()] },
    { sql: 'UPDATE products SET stock = stock - 1 WHERE id = ?', args: [productId] },
  ], 'write')

  const updated = toObject<DbProduct>(await db.execute({ sql: 'SELECT stock FROM products WHERE id = ?', args: [productId] }))
  return NextResponse.json(
    { success: true, message: `${product.name} has been reserved successfully.`, stock: updated!.stock },
    { headers: corsHeaders }
  )
}
