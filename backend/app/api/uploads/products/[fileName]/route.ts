import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import { localProductImagePath, mimeTypeForImage } from '@/lib/storage'

export async function GET(_: NextRequest, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params
  const filePath = localProductImagePath(fileName)
  if (!filePath) return new NextResponse('Not found', { status: 404 })

  try {
    const contents = await fs.readFile(filePath)
    return new NextResponse(contents, { headers: { 'Content-Type': mimeTypeForImage(fileName), 'Cache-Control': 'public, max-age=31536000, immutable' } })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
