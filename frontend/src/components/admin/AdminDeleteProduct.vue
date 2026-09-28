<template>
    <button
        @click="openModal"
        class="bg-red-800 text-white px-5 py-2 rounded-lg hover:bg-red-700"
    >
        Delete
    </button>
    <div
        v-if="isOpen" 
        class="fixed flex items-center justify-center bg-black/50 inset-0 z-50"
    >
        <div class="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 class="text-2xl font-bold mb-4">Delete Product</h2>
            <p class="mb-4">
                Are you sure you want to delete 
                <span class="font-bold">"{{ product.name }}"</span>?
                This action will remove it from your inventory and store listings, and cannot be undone.
            </p>
            <div class="flex justify-end gap-4">
                <button
                    @click="closeModal"
                    class="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
                >
                    Cancel
                </button>
                <button 
                    @click="handleDelete"
                    class="bg-red-800 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                > 
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Product } from '../../types/product'; 

const props = defineProps<{
    product: Product
}>();

const isOpen = ref(false);

const openModal = () => {
    isOpen.value = true;
}


const closeModal = () => {
    isOpen.value = false;
}


const emit = defineEmits<{
    (e: 'delete', productId: number): void
}>();

const handleDelete = () => {
    emit('delete', props.product.id);
    closeModal();
};
</script>