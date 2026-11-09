export type Reservation = {
  id: string
  confirmationNumber: string
  productId: number
  productName: string
  firstName: string
  lastName: string
  phoneNumber: string
  reservedAt: string
  expiresAt: string
  status: 'Active' | 'Expired'
}
