import { NextRequest, NextResponse } from 'next/server'
import { getClient, toObjects } from '@/lib/db'
import { corsHeaders, handleOptions } from '@/lib/cors'

export function OPTIONS() {
  return handleOptions()
}

// GET /api/analytics — summary stats for the admin Customers dashboard
export async function GET() {
  const db = await getClient()

  const [visitsRs, avgRs, reservationsRs, clicksRs, topPagesRs, recentRs] = await Promise.all([
    db.execute('SELECT COUNT(*) AS total FROM page_visits'),
    db.execute('SELECT AVG(duration_seconds) AS avg FROM page_visits WHERE duration_seconds > 0'),
    db.execute('SELECT COUNT(*) AS total FROM reservations'),
    db.execute('SELECT COUNT(*) AS total FROM event_link_clicks'),
    db.execute(`
      SELECT path, COUNT(*) AS visits
      FROM page_visits
      GROUP BY path
      ORDER BY visits DESC
      LIMIT 8
    `),
    db.execute(`
      SELECT path, duration_seconds, visited_at
      FROM page_visits
      ORDER BY visited_at DESC
      LIMIT 20
    `),
  ])

  return NextResponse.json({
    totalVisits:       Number(visitsRs.rows[0][0] ?? 0),
    avgTimeSec:        Math.round(Number(avgRs.rows[0][0] ?? 0)),
    productsReserved:  Number(reservationsRs.rows[0][0] ?? 0),
    eventLinkClicks:   Number(clicksRs.rows[0][0] ?? 0),
    topPages:          toObjects<{ path: string; visits: number }>(topPagesRs),
    recentVisits:      toObjects<{ path: string; duration_seconds: number; visited_at: string }>(recentRs),
  }, { headers: corsHeaders })
}

// POST /api/analytics — record a page visit or event link click
export async function POST(request: NextRequest) {
  const db = await getClient()
  const body = await request.json().catch(() => ({}))

  if (body.type === 'event_click') {
    if (!body.eventTitle) {
      return NextResponse.json({ error: 'eventTitle required' }, { status: 400, headers: corsHeaders })
    }
    await db.execute({
      sql: 'INSERT INTO event_link_clicks (event_title, clicked_at) VALUES (?, ?)',
      args: [String(body.eventTitle), new Date().toISOString()],
    })
    return NextResponse.json({ ok: true }, { headers: corsHeaders })
  }

  // Default: page visit
  if (!body.path) {
    return NextResponse.json({ error: 'path required' }, { status: 400, headers: corsHeaders })
  }
  await db.execute({
    sql: 'INSERT INTO page_visits (path, duration_seconds, visited_at) VALUES (?, ?, ?)',
    args: [String(body.path), Math.max(0, Math.round(Number(body.duration ?? 0))), new Date().toISOString()],
  })
  return NextResponse.json({ ok: true }, { headers: corsHeaders })
}
