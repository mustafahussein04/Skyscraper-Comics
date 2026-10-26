import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'
import { parseProductInput, validateProduct } from '@/lib/product-input'
import { deleteProductImage, storeProductImage, validateProductImage } from '@/lib/storage'

type RouteContext = { params: Promise<{ id: string }> }

export function OPTIONS() {
  return handleOptions()
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const db = await getClient()
  const product = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] }))
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }
  return NextResponse.json(product, { headers: corsHeaders })
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const db = await getClient()
  const input = await parseProductInput(request)
  const validationError = validateProduct(input) ?? validateProductImage(input.imageFile)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400, headers: corsHeaders })
  }

  const existing = toObject<{ id: number; image: string }>(await db.execute({ sql: 'SELECT id, image FROM products WHERE id = ?', args: [id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }

  const uploaded = input.imageFile
    ? await storeProductImage(input.imageFile, new URL(request.url).origin)
    : null
  const image = uploaded?.url ?? (input.image || existing.image)

  try {
    await db.execute({
      sql: 'UPDATE products SET name=?, price=?, type=?, brand=?, stock=?, description=?, image=? WHERE id=?',
      args: [input.name.trim(), Number(input.price), input.type, input.brand.trim(), Number(input.stock), input.description.trim(), image, id],
    })
  } catch (error) {
    if (uploaded) await deleteProductImage(uploaded.url)
    throw error
  }

  if (uploaded && existing.image && existing.image !== uploaded.url) {
    await deleteProductImage(existing.image)
  }

  const updated = toObject(await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] }))
  return NextResponse.json(updated, { headers: corsHeaders })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const db = await getClient()
  const existing = toObject<{ id: number; image: string }>(await db.execute({ sql: 'SELECT id, image FROM products WHERE id = ?', args: [id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
  }
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] })
  await deleteProductImage(existing.image)
  return NextResponse.json({ success: true }, { headers: corsHeaders })
}
