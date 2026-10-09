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

  const existing = toObject(await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [params.id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }

  await db.execute({
    sql: 'UPDATE products SET name=?, price=?, type=?, brand=?, stock=?, description=?, image=? WHERE id=?',
    args: [name, Number(price), type, brand, Number(stock), description ?? '', image ?? '', params.id],
  })

  const updated = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [params.id] }))
  return NextResponse.json(updated, { headers: corsHeaders })
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
