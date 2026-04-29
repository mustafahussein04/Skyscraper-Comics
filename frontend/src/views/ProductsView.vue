<template>
    <div>
        <h1>Our Products</h1>
        <!-- SCRUM-5 - Search bar, and other tester buttons -->
        <div class="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div class="flex flex-col flex-row gap-4">
                <input type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" value>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
                <PrimaryButton>Test</PrimaryButton>
            </div>
        </div>
        <!-- SCRUM-5-->
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { products } from '@/mock-data/products'
import type { Product } from '@/types/product'
import PrimaryButton from '@/components/ui/PrimaryButton.vue';

const props = defineProps<{ type: 'comics' | 'tcg' }>()

const searchQuery = ref('')
const selecteFilter = ref('All')

const filteredProducts = computed(() => {
    return products.filter((p: Product) => {
        const matchesType = p.type === props.type

        const matchesFilter = selecteFilter.value === 'All' || p.category === selecteFilter.value

        const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        return matchesType && matchesFilter && matchesSearch
    })
})

</script>