import type { Product } from '@/types/product'

export const products: Product[] = [
  {
    id: 1,
    name: 'Amazing Spider-Man #50',
    price: 4.99,
    type: 'comics',
    brand: 'Marvel',
    stock: 25,
    description: 'Classic Spider-Man issue',
    image: '/images/spiderman.jpg'
  },
  {
    id: 2,
    name: 'Batman: The Dark Knight Returns',
    price: 14.99,
    type: 'comics',
    brand: 'Marvel',
    stock: 4,
    description: 'Classic Batman issue',
    image: '/images/batman.jpg'
  }
]