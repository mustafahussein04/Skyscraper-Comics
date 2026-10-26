export type ProductInput = {
  name: string
  price: string
  type: string
  brand: string
  stock: string
  description: string
  image: string
  imageFile: File | null
}

export async function parseProductInput(request: Request): Promise<ProductInput> {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('productImage')
    return {
      name: String(form.get('name') ?? ''),
      price: String(form.get('price') ?? ''),
      type: String(form.get('type') ?? ''),
      brand: String(form.get('brand') ?? ''),
      stock: String(form.get('stock') ?? ''),
      description: String(form.get('description') ?? ''),
      image: String(form.get('image') ?? ''),
      imageFile: file instanceof File && file.size > 0 ? file : null,
    }
  }

  const body = await request.json()
  return { ...body, image: body.image ?? '', imageFile: null }
}

export function validateProduct(product: ProductInput): string | null {
  if (!product.name.trim()) return 'Product name is required.'
  if (!product.description.trim()) return 'Description is required.'
  if (product.type !== 'comics' && product.type !== 'tcg') return 'Type must be Comics or TCG.'
  if (!product.brand.trim()) return 'Brand is required.'
  const price = Number(product.price)
  if (!Number.isFinite(price) || price < 0) return 'Price must be a valid non-negative number.'
  const stock = Number(product.stock)
  if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a non-negative whole number.'
  return null
}
