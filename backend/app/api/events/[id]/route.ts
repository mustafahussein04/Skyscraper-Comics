import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObject } from '@/lib/db'
import { isValidRegistrationLink } from '@/lib/registrationLink'
import { corsHeaders, handleOptions } from '@/lib/cors'

type RouteContext = { params: { id: string } }

export function OPTIONS() {
  return handleOptions()
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const event = toObject(await db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [params.id] }))
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders })
  }
  return NextResponse.json(event, { headers: corsHeaders })
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const { title, description, date, category, time, game, capacity, entryFee, image, registrationLink } = await request.json()

  const link = registrationLink ?? ''
  if (!isValidRegistrationLink(link)) {
    return NextResponse.json(
      { error: 'Enter a valid Registration Link starting with http:// or https://.' },
      { status: 400, headers: corsHeaders },
    )
  }

  const existing = toObject(await db.execute({ sql: 'SELECT id FROM events WHERE id = ?', args: [params.id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders })
  }

  await db.execute({
    sql: 'UPDATE events SET title=?, description=?, date=?, category=?, time=?, game=?, capacity=?, entryFee=?, image=?, registrationLink=? WHERE id=?',
    args: [title, description ?? '', date, category ?? '', time ?? '', game ?? '', capacity ?? '', entryFee ?? '', image ?? '', link, params.id],
  })

  const updated = toObject(await db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [params.id] }))
  return NextResponse.json(updated, { headers: corsHeaders })
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const db = await getClient()
  const existing = toObject(await db.execute({ sql: 'SELECT id FROM events WHERE id = ?', args: [params.id] }))
  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders })
  }
  await db.execute({ sql: 'DELETE FROM events WHERE id = ?', args: [params.id] })
  return NextResponse.json({ success: true }, { headers: corsHeaders })
}
