import { NextResponse } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const allowedOrigins = new Set([
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

export function headersFor(request?: Request) {
  const origin = request?.headers.get('origin')
  return {
    ...corsHeaders,
    ...(origin && allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  }
}

export function handleOptions(request?: Request) {
  return new NextResponse(null, { status: 204, headers: headersFor(request) })
}
