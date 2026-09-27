<template>
  <div class="max-w-5xl mx-auto px-6 py-8">
    <PageBreadcrumb :pageTitle="product?.name ?? 'Product'" :showTitle="false" :parentCrumbs="[{ label: 'Products', to: '/products' }]" />

    <div v-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Left: Product Image -->
      <div>
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full rounded-lg shadow-md"
        />
      </div>

      <!-- Right: Product Details -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
        <p class="text-2xl font-semibold text-gray-800">${{ product.price.toFixed(2) }}</p>
        <p class="text-base text-gray-500 leading-relaxed mt-4">{{ product.description }}</p>
        <div class="flex items-center gap-2 mt-4">
          <span :class="['inline-block px-3 py-1 rounded-full text-sm', product.inStock ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900']">
            {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
          </span>
          <span class="inline-block bg-gray-700 text-white px-3 py-1 rounded-full text-sm">{{ product.category }}</span>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-gray-500">Product not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { products } from '@/data/products'

const route = useRoute()

const product = computed(() => {
  const id = Number(route.params.id)
  return products.find(p => p.id === id) ?? null
})
</script>
