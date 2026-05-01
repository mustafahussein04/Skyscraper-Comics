<template>
     <!-- Banner to swap between TCG and Comics -->
    <div v-if="showBanner"
         class="relative flex items-center justify-center gap-6 py-1 bg-blue-900 
                px-[30%]">
        <p class="text-white text-lg capitalize">Welcome to the {{ props.type === 'comics' ? 'Comics' : 'TCG' }} storefront!</p>
        <RouterLink 
        :to="props.type === 'comics' ? '/products/tcg' : '/products/comics'"
        class="whitespace-nowrap border border-white text-white hover:bg-white hover:text-black py-1 px-2 rounded-sm transition-colors">
            View {{ props.type === 'comics' ? 'TCG' : 'Comics' }}
        </RouterLink>
        <button 
            @click="showBanner = false"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
            aria-label="Close banner"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>

    <div class="container mx-auto px-4 py-12">
        <!-- Page Header -->
        <h1 class="text-4xl font-bold mb-2">Our Products</h1>
        <p class="text-gray-600 mb-8">Browse our extensive collection of comics and trading card games.</p>

        <!-- Search Bar and Filters -->
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

        <!-- Products Grid -->
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

const showBanner = ref(true)

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