import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'
import { parseProductInput, validateProduct } from '@/lib/product-input'
import { storeProductImage, validateProductImage } from '@/lib/storage'

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
  const input = await parseProductInput(request)
  const validationError = validateProduct(input) ?? validateProductImage(input.imageFile)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400, headers: corsHeaders })
  }

  const image = input.imageFile
    ? (await storeProductImage(input.imageFile, new URL(request.url).origin)).url
    : input.image

  const rs = await db.execute({
    sql: 'INSERT INTO products (name, price, type, brand, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [input.name.trim(), Number(input.price), input.type, input.brand.trim(), Number(input.stock), input.description.trim(), image],
  })

  const product = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [Number(rs.lastInsertRowid)] }))
  return NextResponse.json(product, { status: 201, headers: corsHeaders })
}
