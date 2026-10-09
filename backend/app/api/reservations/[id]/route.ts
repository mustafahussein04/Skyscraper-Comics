import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

type RouteContext = { params: { id: string } }

export function OPTIONS() {
  return handleOptions()
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const reservation = toObject<{ productId: number }>(
    await db.execute({ sql: 'SELECT * FROM reservations WHERE id = ?', args: [params.id] })
  )
  if (!reservation) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404, headers: corsHeaders })
  }

  // Restore stock when cancelling
  await db.batch([
    { sql: 'DELETE FROM reservations WHERE id = ?', args: [params.id] },
    { sql: 'UPDATE products SET stock = stock + 1 WHERE id = ?', args: [reservation.productId] },
  ], 'write')

  return NextResponse.json({ success: true }, { headers: corsHeaders })
}
