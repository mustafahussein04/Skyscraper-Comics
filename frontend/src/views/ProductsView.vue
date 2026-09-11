<template>
    <div class="container mx-auto px-4 py-12">
        <!-- Page Header -->
        <h1 class="text-4xl font-bold mb-2">Our Products</h1>
        <p class="text-gray-600 mb-8">Browse our extensive collection of comics and trading card games.</p>

        <!-- Search Bar and Filters -->
        <div class="mb-8 bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 flex flex-col gap-4">
                <!-- Search Bar -->
                <div class="relative">
                    <!-- magnifying glass icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input v-model="searchQuery" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
                </div>

                <div class="row-span-3 flex items-center gap-2">
                    <!-- filter funnel icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    <p class="text-gray-700 text-md">Filter:</p>
                    <div class="flex items-center gap-2 transition-all">
                        <button
                            v-for="filter in productsFilters"
                            :key="filter"
                            @click="selectedFilter = filter; selectedSubFilter = 'All'"
                            :class="[
                                'px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap',
                                (selectedFilter as string).toLowerCase() === filter.toLowerCase()
                                ? 'bg-blue-900 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                
                            ]"
                            >{{ filter }}</button>
                    </div>
                </div>
                <!-- code from Google Gemini, as well as the following `:key="selectedFilter" -->
                <div 
                    :class="[
                        'grid transition-all ease-in-out',
                        selectedFilter === 'All' ? 'grid-rows-[0fr] opacity-0 duration-200' : 'grid-rows-[1fr] opacity-100 duration-500'
                    ]"
                >
                    <div class="overflow-hidden">
                        <Transition
                            mode="out-in"
                            enter-from-class="opacity-0 scale-y-0"
                            enter-active-class="transform origin-top transition-all duration-500 ease-out"
                            enter-to-class="opacity-100 scale-y-100"
                            leave-from-class="opacity-100 scale-y-100"
                            leave-active-class="transform origin-top transition-all duration-150 ease-in"
                            leave-to-class="opacity-0 scale-y-0"
                        >
                        <!-- end of code from Google Gemini -->
                            <div :key="selectedFilter.toString()" class="flex items-center gap-2">
                                <button
                                    v-for="filter in currentSubFilters"
                                    :key="filter"
                                    @click="selectedSubFilter = filter"
                                    :class="[
                                        'px-4 py-2 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap',
                                        (selectedSubFilter as string).toLowerCase() === 
                                            filter
                                            .toLowerCase()
                                            .normalize('NFD')                  // Code provided by Google Gemini
                                            .replace(/[\u0300-\u036f]/g, ''    // Code provided by Google Gemini
                                        )
                                        ? 'bg-blue-900 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    ]"
                                >{{ filter }}</button>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>

        <!-- Products Grid -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 margin-10 padding-10">
            <ProductCard 
                v-for="Product in filteredProducts"
                :key="Product.id"
                :product="Product" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { products } from '@/mock-data/products'
import type { Product } from '@/types/product'
import ProductCard from '@/components/products/ProductCard.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const selectedFilter = ref(route.params.filter || 'All')
watch(() => selectedFilter.value, (newFilter) => {
    if (newFilter === 'All') {
        router.push({ path: '/products' })
    } else {
        router.push({ path: `/products/${(newFilter as string).toLowerCase()}` })
        selectedFilter.value = (newFilter as string) || 'All'
    }
})
// Code provided by Google Gemini, to make sure that using back and forward buttons in the browser will update the selectedFilter value accordingly
watch(() => route.params.filter, (newUrlFilter) => {
  selectedFilter.value = (newUrlFilter as string) || 'All'
})
// End of code provided by Google Gemini
const selectedSubFilter = ref('All')

const productsFilters = ['All', 'Comics', 'TCG']
const comicsFilters = ['All', 'Marvel', 'DC', 'Image', 'Dark Horse']
const tcgFilters = ['All', 'Pokémon','Yu-Gi-Oh!', 'Magic: The Gathering']

const currentSubFilters = computed(() => {
  if ((selectedFilter.value as string).toLowerCase() === 'comics') {
    return comicsFilters
  } else if ((selectedFilter.value as string).toLowerCase() === 'tcg') {
    return tcgFilters
  } else {
    return []
  }
})

const filteredProducts = computed(() => {
    return products.filter((p: Product) => {
        const matchesType = p.type === (selectedFilter.value as string).toLowerCase() || selectedFilter.value === 'All'
        const matchesBrand = p.brand === selectedSubFilter.value || selectedSubFilter.value === 'All'
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (selectedSubFilter.value === 'Pokémon') selectedSubFilter.value = 'Pokemon'    // looks for products with brand: 'Pokemon' so that products.brand can have 'Pokemon' instead of 'Pokémon'
        return matchesType && matchesBrand && matchesSearch
    })
})

</script>