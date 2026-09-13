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
