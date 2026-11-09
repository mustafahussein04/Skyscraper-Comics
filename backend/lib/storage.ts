import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024
export const PRODUCT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const localImageDirectory = path.join(process.cwd(), 'data', 'uploads', 'products')

function s3Client() {
  const region = process.env.AWS_REGION
  if (!region || !process.env.AWS_S3_BUCKET) return null
  return new S3Client({ region })
}

function extensionForType(type: string) {
  return type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
}

export function validateProductImage(file: File | null): string | null {
  if (!file || file.size === 0) return null
  if (!PRODUCT_IMAGE_TYPES.has(file.type)) return 'Product image must be a JPG, PNG, or WEBP file.'
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) return 'Product image must be 5 MB or smaller.'
  return null
}

export async function storeProductImage(file: File, requestOrigin: string) {
  const key = `products/${crypto.randomUUID()}.${extensionForType(file.type)}`
  const body = Buffer.from(await file.arrayBuffer())
  const client = s3Client()

  if (client) {
    const bucket = process.env.AWS_S3_BUCKET!
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type,
    }))
    const publicBase = process.env.AWS_S3_PUBLIC_URL ?? `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`
    return { key, url: `${publicBase.replace(/\/$/, '')}/${key}` }
  }

  const localKey = key.replace(/^products\//, '')
  await fs.mkdir(localImageDirectory, { recursive: true })
  await fs.writeFile(path.join(localImageDirectory, localKey), body)
  return { key, url: `${requestOrigin}/api/uploads/products/${localKey}` }
}

export async function deleteProductImage(image: string | null | undefined) {
  if (!image) return
  const client = s3Client()
  const bucket = process.env.AWS_S3_BUCKET

  if (client && bucket) {
    const publicBase = process.env.AWS_S3_PUBLIC_URL ?? `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`
    if (image.startsWith(publicBase)) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: image.slice(publicBase.length + 1) }))
    }
    return
  }

  const marker = '/api/uploads/products/'
  const localName = image.includes(marker) ? image.split(marker)[1] : null
  if (localName && !localName.includes('..')) {
    await fs.rm(path.join(localImageDirectory, path.basename(localName)), { force: true })
  }
}

export function localProductImagePath(fileName: string) {
  if (!fileName || fileName !== path.basename(fileName)) return null
  return path.join(localImageDirectory, fileName)
}

export function mimeTypeForImage(fileName: string) {
  const extension = path.extname(fileName).toLowerCase()
  return extension === '.jpg' || extension === '.jpeg'
    ? 'image/jpeg'
    : extension === '.png' ? 'image/png' : 'image/webp'
}
