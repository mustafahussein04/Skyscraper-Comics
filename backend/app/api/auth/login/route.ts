import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, handleOptions } from '@/lib/cors'

export function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skyscrapercomics.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

  if (email === adminEmail && password === adminPassword) {
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  }

  return NextResponse.json(
    { success: false, error: 'Invalid email or password.' },
    { status: 401, headers: corsHeaders }
  )
}
