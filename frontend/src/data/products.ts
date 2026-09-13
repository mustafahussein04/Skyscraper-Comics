export interface Product {
  id: number
  name: string
  image: string
  price: number
  description: string
  category: string
  inStock: boolean
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Amazing Spider-Man #1',
    image: 'https://cdn.marvel.com/u/prod/marvel/i/mg/d/40/5196582d03800/detail.webp',
    price: 9.99,
    description: 'The debut issue of the Amazing Spider-Man series.',
    category: 'Comic Books',
    inStock: true,
  }
]
