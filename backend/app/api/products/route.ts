import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

export function OPTIONS() {
  return handleOptions()
}

export async function GET(request: NextRequest) {
  const db = await getClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const brand = searchParams.get('brand')
  const search = searchParams.get('search')

  let sql = 'SELECT * FROM products WHERE 1=1'
  const args: (string | number)[] = []

  if (type && type.toLowerCase() !== 'all') {
    sql += ' AND type = ?'
    args.push(type)
  }
  if (brand && brand !== 'All') {
    sql += ' AND brand = ?'
    args.push(brand)
  }
  if (search) {
    sql += ' AND name LIKE ?'
    args.push(`%${search}%`)
  }

  const rs = await db.execute({ sql, args })
  return NextResponse.json(toObjects(rs), { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const db = await getClient()
  const { name, price, type, brand, stock, description, image } = await request.json()

  const rs = await db.execute({
    sql: 'INSERT INTO products (name, price, type, brand, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [name, Number(price), type, brand, Number(stock) || 0, description ?? '', image ?? ''],
  })

  const product = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [Number(rs.lastInsertRowid)] }))
  return NextResponse.json(product, { status: 201, headers: corsHeaders })
}
