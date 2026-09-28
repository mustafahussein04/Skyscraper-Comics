<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">Management area</p>
      <h2 class="mt-2 text-3xl font-bold text-gray-900">Products</h2>
      <p class="mt-3 max-w-2xl text-gray-600">Manage the comic book and trading card catalog from this area.</p>
    </div>

    <!-- Add New Product form -->
    <div v-if="showAddForm" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 class="text-xl font-bold text-gray-900 mb-6">Add New Product</h3>

      <form @submit.prevent="handleAddProduct" class="space-y-5">
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="prod-name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              id="prod-name"
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Amazing Spider-Man #1"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label for="prod-price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              id="prod-price"
              v-model="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label for="prod-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="prod-type"
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            >
              <option value="">Select a type</option>
              <option value="comics">Comics</option>
              <option value="tcg">TCG</option>
            </select>
          </div>

          <div>
            <label for="prod-brand" class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              id="prod-brand"
              v-model="form.brand"
              type="text"
              required
              placeholder="e.g. Marvel, Pokemon"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label for="prod-stock" class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              id="prod-stock"
              v-model="form.stock"
              type="number"
              min="0"
              required
              placeholder="0"
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label for="prod-image" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              id="prod-image"
              v-model="form.image"
              type="text"
              placeholder="https://..."
              class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        <div>
          <label for="prod-desc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="prod-desc"
            v-model="form.description"
            rows="3"
            placeholder="Brief description of the product..."
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 resize-none"
          ></textarea>
        </div>

        <p v-if="successMessage" class="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {{ successMessage }}
        </p>

        <!-- Bottom action buttons -->
        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            class="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200"
          >
            Add Product
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
            @click="cancelAddProduct"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Product list / empty state -->
    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-gray-900">Product Catalog</h3>
        <button
          v-if="!showAddForm"
          type="button"
          class="flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
          @click="showAddForm = true"
        >
          <Plus class="h-4 w-4" />
          Add New Product
        </button>
      </div>

      <div v-if="addedProducts.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p class="font-semibold text-gray-700">No products added yet</p>
        <p class="mt-2 text-sm text-gray-500">Click "Add New Product" to add a product to the catalog.</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="product in addedProducts"
          :key="product.id"
          class="flex items-center justify-between py-4"
        >
          <div>
            <p class="font-semibold text-gray-900">{{ product.name }}</p>
            <p class="text-sm text-gray-500 capitalize">{{ product.type }} &middot; {{ product.brand }} &middot; ${{ Number(product.price).toFixed(2) }}</p>
          </div>
          <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Stock: {{ product.stock }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'

const showAddForm = ref(false)
const successMessage = ref('')

const emptyForm = () => ({
  name: '',
  price: '',
  type: '',
  brand: '',
  stock: '',
  description: '',
  image: '',
})

const form = ref(emptyForm())

const addedProducts = ref<Array<ReturnType<typeof emptyForm> & { id: number }>>([])
let nextId = 1

const handleAddProduct = () => {
  addedProducts.value.push({ ...form.value, id: nextId++ })
  successMessage.value = `"${form.value.name}" has been added to the catalog.`
  form.value = emptyForm()
  setTimeout(() => {
    successMessage.value = ''
    showAddForm.value = false
  }, 1500)
}

const cancelAddProduct = () => {
  form.value = emptyForm()
  successMessage.value = ''
  showAddForm.value = false
}
</script>
