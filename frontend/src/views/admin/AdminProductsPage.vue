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
              placeholder="https://... or /images/..."
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
        <p v-if="errorMessage" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {{ errorMessage }}
        </p>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:opacity-60"
          >
            {{ saving ? 'Adding…' : 'Add Product' }}
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

    <!-- Product list -->
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

      <p v-if="loading" class="text-sm text-gray-500">Loading products…</p>

      <div v-else-if="products.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p class="font-semibold text-gray-700">No products yet</p>
        <p class="mt-2 text-sm text-gray-500">Click "Add New Product" to add the first item.</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex items-center justify-between py-4 gap-4"
        >
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-gray-900 truncate">{{ product.name }}</p>
            <p class="text-sm text-gray-500 capitalize">{{ product.type }} &middot; {{ product.brand }} &middot; ${{ Number(product.price).toFixed(2) }}</p>
          </div>
          <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 flex-shrink-0">
            Stock: {{ product.stock }}
          </span>
          <div class="flex gap-2 flex-shrink-0">
            <AdminEditProduct :product="product" @save="handleSaveProduct" />
            <AdminDeleteProduct :product="product" @delete="handleDeleteProduct" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { Product } from '@/types/product'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/api'
import AdminEditProduct from '@/components/admin/AdminEditProduct.vue'
import AdminDeleteProduct from '@/components/admin/AdminDeleteProduct.vue'

const showAddForm = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const saving = ref(false)
const loading = ref(true)
const products = ref<Product[]>([])

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch {
    errorMessage.value = 'Failed to load products. Is the backend running?'
  } finally {
    loading.value = false
  }
})

const emptyForm = () => ({
  name: '',
  price: '',
  type: '' as '' | 'comics' | 'tcg',
  brand: '',
  stock: '',
  description: '',
  image: '',
})

const form = ref(emptyForm())

const handleAddProduct = async () => {
  errorMessage.value = ''
  saving.value = true
  try {
    const created = await createProduct({
      name: form.value.name,
      price: Number(form.value.price),
      type: form.value.type as 'comics' | 'tcg',
      brand: form.value.brand,
      stock: Number(form.value.stock),
      description: form.value.description,
      image: form.value.image,
    })
    products.value.push(created)
    successMessage.value = `"${created.name}" has been added to the catalog.`
    form.value = emptyForm()
    setTimeout(() => {
      successMessage.value = ''
      showAddForm.value = false
    }, 1500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to add product.'
  } finally {
    saving.value = false
  }
}

const handleSaveProduct = async (updated: Product) => {
  try {
    const saved = await updateProduct(updated.id, {
      name: updated.name,
      price: updated.price,
      type: updated.type,
      brand: updated.brand,
      stock: updated.stock,
      description: updated.description,
      image: updated.image,
    })
    const idx = products.value.findIndex(p => p.id === saved.id)
    if (idx !== -1) products.value[idx] = saved
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to save product.'
  }
}

const handleDeleteProduct = async (productId: number) => {
  try {
    await deleteProduct(productId)
    products.value = products.value.filter(p => p.id !== productId)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to delete product.'
  }
}

const cancelAddProduct = () => {
  form.value = emptyForm()
  successMessage.value = ''
  errorMessage.value = ''
  showAddForm.value = false
}
</script>
