import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

type RouteContext = { params: { id: string } }

export function OPTIONS() {
  return handleOptions()
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const product = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [params.id] }))
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }
  return NextResponse.json(product, { headers: corsHeaders })
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const { name, price, type, brand, stock, description, image } = await request.json()
  const validationError = validateProduct({ name, price, type, brand, stock, description })
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400, headers: corsHeaders })
  }

  const existing = toObject(await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [params.id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }

  await db.execute({
    sql: 'UPDATE products SET name=?, price=?, type=?, brand=?, stock=?, description=?, image=? WHERE id=?',
    args: [name.trim(), Number(price), type, brand.trim(), Number(stock), description.trim(), image ?? '', params.id],
  })

  const updated = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [params.id] }))
  return NextResponse.json(updated, { headers: corsHeaders })
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

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const existing = toObject(await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [params.id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [params.id] })
  return NextResponse.json({ success: true }, { headers: corsHeaders })
}
