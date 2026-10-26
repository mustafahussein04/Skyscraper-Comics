import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject, toObjects } from '@/lib/db'
import { isValidRegistrationLink } from '@/lib/registrationLink'
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
  const { title, description, date, category, time, game, capacity, entryFee, image, registrationLink } = await request.json()

  const link = registrationLink ?? ''
  if (!isValidRegistrationLink(link)) {
    return NextResponse.json(
      { error: 'Enter a valid Registration Link starting with http:// or https://.' },
      { status: 400, headers: corsHeaders },
    )
  }

  const rs = await db.execute({
    sql: 'INSERT INTO events (title, description, date, category, time, game, capacity, entryFee, image, registrationLink) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [title, description ?? '', date, category ?? '', time ?? '', game ?? '', capacity ?? '', entryFee ?? '', image ?? '', link],
  })

  const event = toObject(await db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [Number(rs.lastInsertRowid)] }))
  return NextResponse.json(event, { status: 201, headers: corsHeaders })
}
