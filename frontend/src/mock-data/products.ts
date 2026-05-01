import type { Product } from '@/types/product'

export const products: Product[] = [
  /*
    id: product id number,
    name: 'item title',
    price: item price as a number in dollars and cents (e.g. 4.99),
    type: 'comics' or 'tcg',
    brand: for comics: 'Marvel', 'DC', 'Dark Horse', 'Image', or 'Other' 
           for tcg: 'Pokemon', 'Magic: The Gathering', 'Yu-Gi-Oh!', or 'Other',
    stock: amount of this item left in stock,
    description: 'the text that appears below the item's title on the product card',
    image: 'path to the image file'
  */
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
    brand: 'DC',
    stock: 4,
    description: 'Classic Batman issue',
    image: '/images/batman.jpg'
  },
  {
    id: 3,
    name: 'A really long name for a product that you should buy right now',
    price: 249.99,
    type: 'comics',
    brand: 'Marvel',
    stock: 0,
    description: 'The most important comic book in the history of comics. It is so important that it has a really long name to show how important it is. You should buy this comic book right now because it is the most important comic book in the history of comics.',
    image: '/images/doesnt-exist.jpg'
  },
  {
    id: 4,
    name: 'Hellboy #1',
    price: 4.99,
    type: 'comics',
    brand: 'Dark Horse',
    stock: 0,
    description: 'A classic issue of Hellboy.',
    image: '/images/hellboy-1.jpg'
  },
  {
    id: 5,
    name: 'Blue-Eyes White Dragon',
    price: 64.99,
    type: 'tcg',
    brand: 'Yu-Gi-Oh!',
    stock: 1,
    description: 'A classic card from Yu-Gi-Oh!.',
    image: '/images/blue-eyes-white-dragon.jpg'
  },
  {
    id: 6,
    name: 'Charizard',
    price: 64.99,
    type: 'tcg',
    brand: 'Pokemon',
    stock: 1,
    description: 'A classic card from Pokemon.',
    image: '/images/charizard.jpg'
  }
]