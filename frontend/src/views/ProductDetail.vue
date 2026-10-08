<template>
  <div class="max-w-5xl mx-auto px-6 py-8">
    <PageBreadcrumb :pageTitle="product?.name ?? 'Product'" :showTitle="false" :parentCrumbs="[{ label: 'Products', to: '/products' }]" />

    <p v-if="loading" class="text-gray-500">Loading…</p>

    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
          <span :class="['inline-block px-3 py-1 rounded-full text-sm', product.stock > 0 ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900']">
            {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
          </span>
          <span class="inline-block bg-gray-700 text-white px-3 py-1 rounded-full text-sm capitalize">{{ product.type }}</span>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-gray-500">Product not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getProduct } from '@/services/api'
import type { Product } from '@/types/product'

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    product.value = await getProduct(id)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
})
</script>
