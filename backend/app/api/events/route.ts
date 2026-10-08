import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

export function OPTIONS() {
  return handleOptions()
}

export async function GET() {
  const db = await getClient()
  const rs = await db.execute('SELECT * FROM events ORDER BY date ASC')
  return NextResponse.json(toObjects(rs), { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const db = await getClient()
  const { title, description, date, category, time, game, capacity, entryFee, image } = await request.json()

  const rs = await db.execute({
    sql: 'INSERT INTO events (title, description, date, category, time, game, capacity, entryFee, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [title, description ?? '', date, category ?? '', time ?? '', game ?? '', capacity ?? '', entryFee ?? '', image ?? ''],
  })

  const event = toObject(await db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [Number(rs.lastInsertRowid)] }))
  return NextResponse.json(event, { status: 201, headers: corsHeaders })
}
