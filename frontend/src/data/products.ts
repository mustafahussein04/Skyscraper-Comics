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
  },
  {
    id: 2,
    name: 'Batman: Year One',
    image: 'https://cdn.marvel.com/u/prod/marvel/i/mg/d/40/5196582d03800/detail.webp',
    price: 14.99,
    description: 'Frank Miller\'s iconic origin story of Batman.',
    category: 'Comic Books',
    inStock: true,
  },
  {
    id: 3,
    name: 'Magic: The Gathering Booster Pack',
    image: 'https://cdn.marvel.com/u/prod/marvel/i/mg/d/40/5196582d03800/detail.webp',
    price: 4.99,
    description: 'A random booster pack from the latest set.',
    category: 'Trading Cards',
    inStock: false,
  },
]
