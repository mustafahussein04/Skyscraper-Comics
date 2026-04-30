<template>
    <div class="bg-white p-4 rounded-lg shadow-sm">
        <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover mb-4">
        <div>
            <h2 class="text-xl font-bold mb-2">{{ product.name }}</h2>
            <p class="text-gray-600 mb-2">{{ product.description }}</p>
            <p class="text-2xl font-bold">${{ product.price.toFixed(2) }}</p>
        </div>
        
    </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/product'

defineProps<{
  product: Product
}>()
</script>