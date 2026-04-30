<template>
    <div class="container mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold mb-2">Our Products</h1>
        <p class="text-gray-600 mb-8">Browse our extensive collection of comics and trading card games.</p>
        <!-- SCRUM-5 - Search bar, and other tester buttons -->
        <div class="mb-8 bg-white px-6 py-4 rounded-lg shadow-sm flex flex-col flex-row items-center gap-4">
            <input v-model="searchQuery" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
            <p class="text-gray-700 text-md">Filter:</p>
            <button
            v-for="filter in currentFilters"
            :key="filter"
            @click="selectedFilter = filter"
            :class="[
                'px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap hover:bg-gray-200',
                selectedFilter === filter 
                ? 'bg-blue-900 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:border-blue-400'
                
            ]"
            >{{ filter }}</button>
        </div>
        <!-- SCRUM-5-->

        <!-- Products -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 gap-6 margin-10 padding-10">
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
import ProductCard from '@/components/products/ProductCard.vue'

const props = defineProps<{
    product: Product,
    type: 'comics' | 'tcg' }>()

const searchQuery = ref('')
const selectedFilter = ref('All')
const comicsFilters = ['All', 'Marvel', 'DC', 'Image', 'Dark Horse', 'Other']
const tcgFilters = ['All', 'Pokémon','Yu-Gi-Oh!', 'Magic: The Gathering', 'Other']
const currentFilters = computed(() => {
  return props.type === 'comics' ? comicsFilters : tcgFilters
})

const filteredProducts = computed(() => {
    return products.filter((p: Product) => {
        const matchesType = p.type === props.type
        const matchesBrand = selectedFilter.value === 'All' || p.brand === selectedFilter.value
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (selectedFilter.value === 'Pokémon') selectedFilter.value = 'Pokemon'    // looks for products with brand: 'Pokemon' so that products.brand can have 'Pokemon' instead of 'Pokémon'
        return matchesType && matchesBrand && matchesSearch
    })
})

</script>