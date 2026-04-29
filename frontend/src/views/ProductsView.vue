<template>
    <div>
        <h1>Our Products</h1>
        <!-- SCRUM-5 - Search bar, and other tester buttons -->
        <div class="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div class="flex flex-col flex-row gap-4">
                <input v-model="searchQuery" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" value>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
            </div>
        </div>
        <!-- SCRUM-5-->

        <!-- Products -->
         <div class = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductCard 
                v-for="Product in filteredProducts"
                :key="Product.id"
                :product="Product" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { products } from '@/mock-data/products'
import type { Product } from '@/types/product'
import PrimaryButton from '@/components/ui/PrimaryButton.vue';
import ProductCard from '@/components/products/ProductCard.vue'

const props = defineProps<{
    product: Product,
    type: 'comics' | 'tcg' }>()

const searchQuery = ref('')
const selectedFilter = ref('All')

const filteredProducts = computed(() => {
    return products.filter((p: Product) => {
        const matchesType = p.type === props.type

        const matchesFilter = selectedFilter.value === 'All' || p.type === selectedFilter.value

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        return matchesType && matchesFilter && matchesSearch
    })
})

</script>