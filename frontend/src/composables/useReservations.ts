import type { Product } from '@/types/product'
import type { Reservation } from '@/types/reservation'

const RESERVATIONS_KEY = 'skyscraper-comics-reservations'
const STOCK_KEY = 'skyscraper-comics-stock'

type StockByProductId = Record<string, number>

const readReservations = (): Reservation[] => {
  const storedReservations = localStorage.getItem(RESERVATIONS_KEY)

  if (!storedReservations) return []

  try {
    return JSON.parse(storedReservations) as Reservation[]
  } catch {
    return []
  }
}

const readStock = (): StockByProductId => {
  const storedStock = localStorage.getItem(STOCK_KEY)

  if (!storedStock) return {}

  try {
    return JSON.parse(storedStock) as StockByProductId
  } catch {
    return {}
  }
}

export const getCurrentUserEmail = (): string => {
  return localStorage.getItem('skyscraper-comics-current-user') ?? ''
}

export const getProductStock = (product: Product): number => {
  const stock = readStock()
  return stock[String(product.id)] ?? product.stock
}

export const reserveProduct = (
  product: Product,
  userEmail: string,
): { success: boolean; message: string; stock: number } => {
  if (!userEmail) {
    return {
      success: false,
      message: 'Please sign in before reserving an item.',
      stock: getProductStock(product),
    }
  }

  const reservations = readReservations()
  const alreadyReserved = reservations.some(
    (reservation) =>
      reservation.productId === product.id && reservation.userEmail === userEmail,
  )

  if (alreadyReserved) {
    return {
      success: false,
      message: 'You have already reserved this item.',
      stock: getProductStock(product),
    }
  }

  const stock = readStock()
  const currentStock = stock[String(product.id)] ?? product.stock

  if (currentStock <= 0) {
    return {
      success: false,
      message: 'This item is sold out.',
      stock: 0,
    }
  }

  const updatedStock = currentStock - 1
  const reservation: Reservation = {
    id: `${Date.now()}-${product.id}`,
    productId: product.id,
    userEmail,
    reservedAt: new Date().toISOString(),
  }

  localStorage.setItem(
    RESERVATIONS_KEY,
    JSON.stringify([...reservations, reservation]),
  )
  localStorage.setItem(
    STOCK_KEY,
    JSON.stringify({ ...stock, [String(product.id)]: updatedStock }),
  )

  return {
    success: true,
    message: `${product.name} has been reserved successfully.`,
    stock: updatedStock,
  }
}
