<template>
    <button
        @click="openModal"
        class="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
    >
        Edit
    </button>
    <div
        v-if="isOpen" 
        class="fixed flex items-center justify-center bg-black/50 inset-0 z-50"
    >
        <div class="w-full max-w-lg rounded-xl bg-white p-6">
            <h2 class="text-2xl font-bold mb-4">Edit "{{ form.name }}"</h2>
            <form @submit.prevent="handleSubmit">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                        v-model="form.name" 
                        type="text" 
                        class="w-full rounded-lg border border-black-300 px-3 py-2 text-sm text-black-800 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <input 
                        v-model="form.brand" 
                        type="text" 
                        class="w-full rounded-lg border border-black-300 px-3 py-2 text-sm text-black-800 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select 
                        v-model="form.type" 
                        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="comics">comics</option>
                        <option value="tcg">tcg</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Price</label>
                    <input 
                        v-model="form.price" 
                        type="number" 
                        step="0.01"
                        class="w-full rounded-lg border border-black-300 px-3 py-2 text-sm text-black-800 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                    <input 
                        v-model="form.stock" 
                        type="number" 
                        step="1"
                        class="w-full rounded-lg border border-black-300 px-3 py-2 text-sm text-black-800 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                        v-model="form.description" 
                        type="text" 
                        rows="3"
                        class="w-full rounded-lg border border-black-300 px-3 py-2 text-sm text-black-800 focus:border-blue-500 focus:outline-none"
                        required
                    ></textarea>
                </div>
                <div class="flex justify-end gap-4">
                    <button
                        @click="closeModal"
                        class="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        class="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
                    > 
                        Save
                    </button>
                </div>
            </form>
            
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
    (e: 'save', updatedProduct: Product): void
}>();

const form = ref<Product>({ ...props.product });

const handleSubmit = () => {
    emit('save', form.value);
    closeModal();
};
</script>