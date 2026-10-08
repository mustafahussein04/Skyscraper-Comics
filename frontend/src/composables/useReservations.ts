import type { Product } from '@/types/product'
import { createReservation } from '@/services/api'

export const getCurrentUserEmail = (): string => {
  return localStorage.getItem('skyscraper-comics-current-user') ?? ''
}

export const reserveProduct = async (
  product: Product,
  userEmail: string,
): Promise<{ success: boolean; message: string; stock: number }> => {
  if (!userEmail) {
    return { success: false, message: 'Please sign in before reserving an item.', stock: product.stock }
  }

  try {
    return await createReservation(product.id, userEmail)
  } catch {
    return { success: false, message: 'Failed to reserve item. Please try again.', stock: product.stock }
  }
}
