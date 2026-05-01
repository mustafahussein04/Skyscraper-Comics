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
            <!-- x button to close banner -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
        </button>
    </div>

    <div class="container mx-auto px-4 py-12">
        <!-- Page Header -->
        <h1 class="text-4xl font-bold mb-2">Our Products</h1>
        <p class="text-gray-600 mb-8">Browse our extensive collection of comics and trading card games.</p>

        <!-- Search Bar and Filters -->
        <div class="mb-8 bg-white px-6 py-4 rounded-lg shadow-sm flex flex-col flex-row items-center gap-4">
            <!-- Search Bar -->
            <div class="flex-1 relative">
                <!-- magnifying glass icon -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input v-model="searchQuery" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
            </div>

            <div class="flex items-center gap-2">
                <!-- filter funnel icon -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                <p class="text-gray-700 text-md">Filter:</p>
            </div>
            
            <button
            v-for="filter in currentFilters"
            :key="filter"
            @click="selectedFilter = filter"
            :class="[
                'px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap',
                selectedFilter === filter 
                ? 'bg-blue-900 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                
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