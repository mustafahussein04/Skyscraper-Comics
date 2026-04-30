<template>
    <div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <img :src="product.image" :alt="product.name" class="w-full h-64 object-cover mb-4">
        <div>
            <div class="flex items-center justify-between">
                <p class="text-sm mb-1 bg-blue-100 text-blue-900 px-2 py-1 rounded capitalize">{{ getBrandLabel(product.brand) }}</p>
                <p class="text-sm mb-1 px-2 py-1 rounded" 
                    :class="getStockColor(product.stock)"
                >
                    {{ getStockLabel(product.stock) }}
                </p>
                
            </div>
            <h3 class="text-xl font-bold mb-2 h-20px sm:h-32px md:h-48px lg:h-64px xl:h-80px line-clamp-2 h-[3em]">{{ product.name }}</h3>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2 h-[3em]">{{ product.description }}</p>
            <div class="flex items-center justify-between">
                <p class="text-2xl font-bold">${{ product.price.toFixed(2) }}</p>
                <button>Reserve</button>
            </div>
        </div>
        
    </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/product'

defineProps<{
  product: Product
}>()

const getStockColor = (stock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-900';
  if (stock < 5) return 'bg-yellow-100 text-yellow-900';
  return 'bg-green-100 text-green-900';
}

const getStockLabel = (stock: number) => {
  if (stock === 0) return 'Out of Stock'
  if (stock < 5) return `Limited: ${stock}`
  return `In Stock: ${stock}`
}

const getBrandLabel = (brand: string) => {  // looks for products with brand: 'Pokemon' or whichever brand is selected otherwise
    if (brand === 'Pokemon') return 'Pokémon'
    return brand
}
</script>