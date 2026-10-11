import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { corsHeaders, handleOptions } from '@/lib/cors'

const DEFAULT_ADMIN_EMAIL = 'admin@skyscrapercomics.com'
const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$12$bZAVE6xF.MY0FNv4S3d6MOManSpqg1vxXpfDfW037EZMZuCjZj2Pe'

export function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  let credentials: { email?: unknown; password?: unknown }

  try {
    credentials = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid email or password.' },
      { status: 401, headers: corsHeaders }, 
    )
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? DEFAULT_ADMIN_PASSWORD_HASH
  const email = typeof credentials.email === 'string' ? credentials.email : ''
  const password = typeof credentials.password === 'string' ? credentials.password : ''

  const passwordMatches = await bcrypt.compare(password, adminPasswordHash)

  if (email === adminEmail && passwordMatches) {
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  }

  return NextResponse.json(
    { success: false, error: 'Invalid email or password.' },
    { status: 401, headers: corsHeaders }
  )
}
