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
                <div>
                    <label for="edit-prod-image" class="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                    <input id="edit-prod-image" type="file" accept="image/jpeg,image/png,image/webp" @change="handleImageChange" class="sr-only" />
                    <div class="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2">
                        <label for="edit-prod-image" class="inline-flex cursor-pointer items-center rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-within:outline-none focus-within:ring-4 focus-within:ring-blue-100">
                            Choose File
                        </label>
                        <span class="min-w-0 truncate text-sm text-slate-600">
                            {{ imageFile?.name ?? 'No file chosen' }}
                        </span>
                    </div>
                    <img v-if="previewImage" :src="previewImage" alt="Product preview" class="mt-3 h-32 w-32 rounded-lg object-cover" />
                    <p class="mt-1 text-xs text-slate-500">Choose a new JPG, PNG, or WEBP image to replace the current one. Maximum 5 MB.</p>
                    <p v-if="imageError" class="mt-1 text-sm text-red-600">{{ imageError }}</p>
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
import { ref, watch } from 'vue';
import type { Product } from '../../types/product'; 

const props = defineProps<{
    product: Product
}>();

const isOpen = ref(false);
const imageFile = ref<File | null>(null)
const previewImage = ref(props.product.image)
const imageError = ref('')

const openModal = () => {
    isOpen.value = true;
    imageFile.value = null
    imageError.value = ''
    previewImage.value = props.product.image
}

const closeModal = () => {
    isOpen.value = false;
}


const emit = defineEmits<{
    (e: 'save', updatedProduct: Product, imageFile: File | null): void
}>();

const form = ref<Product>({ ...props.product });

const handleImageChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    imageError.value = ''
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
        imageError.value = file.size > 5 * 1024 * 1024 ? 'Product image must be 5 MB or smaller.' : 'Product image must be a JPG, PNG, or WEBP file.'
        input.value = ''
        return
    }
    imageFile.value = file
    previewImage.value = file ? URL.createObjectURL(file) : props.product.image
}

const handleSubmit = () => {
    if (imageError.value) return
    emit('save', { ...form.value, image: previewImage.value }, imageFile.value);
    closeModal();
};

watch(() => props.product, (product) => {
    form.value = { ...product }
    previewImage.value = product.image
}, { deep: true })
</script>
