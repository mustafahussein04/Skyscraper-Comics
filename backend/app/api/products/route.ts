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
  const validationError = validateProduct({ name, price, type, brand, stock, description })
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400, headers: corsHeaders })
  }

  const rs = await db.execute({
    sql: 'INSERT INTO products (name, price, type, brand, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [name.trim(), Number(price), type, brand.trim(), Number(stock), description.trim(), image ?? ''],
  })

  const product = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [Number(rs.lastInsertRowid)] }))
  return NextResponse.json(product, { status: 201, headers: corsHeaders })
}

function validateProduct(product: { name: unknown; price: unknown; type: unknown; brand: unknown; stock: unknown; description: unknown }): string | null {
  if (typeof product.name !== 'string' || !product.name.trim()) return 'Product name is required.'
  if (typeof product.description !== 'string' || !product.description.trim()) return 'Description is required.'
  if (product.type !== 'comics' && product.type !== 'tcg') return 'Type must be Comics or TCG.'
  if (typeof product.brand !== 'string' || !product.brand.trim()) return 'Brand is required.'
  const price = Number(product.price)
  if (!Number.isFinite(price) || price < 0) return 'Price must be a valid non-negative number.'
  const stock = Number(product.stock)
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a non-negative whole number.'
  return null
}
