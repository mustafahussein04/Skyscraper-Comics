export type Product = {
  id: number
  name: string
  price: number
  type: 'comics' | 'tcg'
  brand: string
  stock: number
  description: string
  image: string
}