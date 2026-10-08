import { NextResponse } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function handleOptions() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}
