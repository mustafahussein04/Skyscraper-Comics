<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">
      Management Area
    </p>

    <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">
          {{ title }}
        </h2>

        <p class="mt-3 max-w-2xl text-gray-600">
          {{ description }}
        </p>
      </div>

      <!-- Only show this button on the Products page -->
      <button
        v-if="title === 'Products'"
        type="button"
        class="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white
               transition hover:bg-violet-700"
        @click="openAddForm"
      >
        + Add New Product
      </button>
    </div>

    <!-- Product management table -->
    <div v-if="title === 'Products'" class="mt-8">
      <div
        v-if="products.length === 0"
        class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center"
      >
        <p class="font-semibold text-gray-700">No products have been added.</p>
        <p class="mt-2 text-sm text-gray-500">
          Select “Add New Product” to add your first product.
        </p>
      </div>

      <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th class="px-4 py-3">Product</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Price</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="h-14 w-14 rounded-lg object-cover"
                  >

                  <div
                    v-else
                    class="flex h-14 w-14 items-center justify-center rounded-lg
                           bg-gray-200 text-xs text-gray-500"
                  >
                    No image
                  </div>

                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ product.name }}
                    </p>

                    <p class="max-w-xs truncate text-sm text-gray-500">
                      {{ product.description }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 text-gray-700">
                {{ product.category }}
              </td>

              <td class="px-4 py-4 font-semibold text-gray-900">
                ${{ product.price.toFixed(2) }}
              </td>

              <td class="px-4 py-4">
                <span
                  class="rounded-full px-3 py-1 text-sm font-semibold"
                  :class="getStockColor(product.stock)"
                >
                  {{ product.stock }}
                </span>
              </td>

              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-lg bg-blue-100 px-4 py-2 font-semibold
                           text-blue-700 hover:bg-blue-200"
                    @click="openEditForm(product)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="rounded-lg bg-red-100 px-4 py-2 font-semibold
                           text-red-700 hover:bg-red-200"
                    @click="deleteProduct(product)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Original placeholder for other admin pages -->
    <div
      v-else
      class="mt-8 rounded-xl border border-dashed border-gray-300
             bg-gray-50 p-8 text-center"
    >
      <p class="font-semibold text-gray-700">
        {{ title }} tools are coming next
      </p>

      <p class="mt-2 text-sm text-gray-500">
        This page establishes the navigation and layout without adding
        management actions yet.
      </p>
    </div>
  </section>

  <!-- Add/Edit product popup -->
  <Teleport to="body">
    <div
      v-if="showProductForm"
      class="fixed inset-0 z-50 flex items-center justify-center
             bg-black/50 p-4"
      @click.self="closeProductForm"
    >
      <div
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto
               rounded-2xl bg-white shadow-xl"
      >
        <div class="flex items-center justify-between border-b p-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-violet-600">
              Product Management
            </p>

            <h2 class="mt-1 text-2xl font-bold text-gray-900">
              {{ editingProductId === null ? 'Add New Product' : 'Edit Product' }}
            </h2>
          </div>

          <button
            type="button"
            class="text-3xl text-gray-500 hover:text-gray-900"
            aria-label="Close product form"
            @click="closeProductForm"
          >
            &times;
          </button>
        </div>

        <form class="space-y-5 p-6" @submit.prevent="saveProduct">
          <div>
            <label for="productName" class="mb-1 block font-semibold text-gray-700">
              Product Name
            </label>

            <input
              id="productName"
              v-model.trim="productForm.name"
              type="text"
              required
              placeholder="Amazing Spider-Man #50"
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-violet-500 focus:ring-2
                     focus:ring-violet-200"
            >
          </div>

          <div>
            <label
              for="productDescription"
              class="mb-1 block font-semibold text-gray-700"
            >
              Description
            </label>

            <textarea
              id="productDescription"
              v-model.trim="productForm.description"
              rows="3"
              required
              placeholder="Enter a description of the product"
              class="w-full resize-none rounded-lg border border-gray-300
                     px-4 py-3 outline-none focus:border-violet-500
                     focus:ring-2 focus:ring-violet-200"
            ></textarea>
          </div>

          <div>
            <label
              for="productCategory"
              class="mb-1 block font-semibold text-gray-700"
            >
              Category
            </label>

            <select
              id="productCategory"
              v-model="productForm.category"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-violet-500 focus:ring-2
                     focus:ring-violet-200"
            >
              <option disabled value="">Select a category</option>
              <option value="Comic Book">Comic Book</option>
              <option value="Trading Card">Trading Card</option>
              <option value="Collectible">Collectible</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                for="productPrice"
                class="mb-1 block font-semibold text-gray-700"
              >
                Price
              </label>

              <input
                id="productPrice"
                v-model.number="productForm.price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="4.99"
                class="w-full rounded-lg border border-gray-300 px-4 py-3
                       outline-none focus:border-violet-500 focus:ring-2
                       focus:ring-violet-200"
              >
            </div>

            <div>
              <label
                for="productStock"
                class="mb-1 block font-semibold text-gray-700"
              >
                Stock
              </label>

              <input
                id="productStock"
                v-model.number="productForm.stock"
                type="number"
                min="0"
                step="1"
                required
                placeholder="10"
                class="w-full rounded-lg border border-gray-300 px-4 py-3
                       outline-none focus:border-violet-500 focus:ring-2
                       focus:ring-violet-200"
              >
            </div>
          </div>

          <div>
            <label
              for="productImage"
              class="mb-1 block font-semibold text-gray-700"
            >
              Image URL
            </label>

            <input
              id="productImage"
              v-model.trim="productForm.image"
              type="url"
              placeholder="https://example.com/product-image.jpg"
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-violet-500 focus:ring-2
                     focus:ring-violet-200"
            >
          </div>

          <div
            v-if="productForm.image"
            class="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <p class="mb-2 text-sm font-semibold text-gray-600">
              Image Preview
            </p>

            <img
              :src="productForm.image"
              alt="Product preview"
              class="h-40 w-40 rounded-lg object-cover"
            >
          </div>

          <div class="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-5 py-3
                     font-semibold text-gray-700 hover:bg-gray-100"
              @click="closeProductForm"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-lg bg-violet-600 px-5 py-3 font-semibold
                     text-white hover:bg-violet-700"
            >
              {{ editingProductId === null ? 'Add Product' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'

defineProps<{
  title: string
  description: string
}>()

interface Product {
  id: number
  name: string
  description: string
  category: string
  price: number
  stock: number
  image: string
}

interface ProductForm {
  name: string
  description: string
  category: string
  price: number
  stock: number
  image: string
}

const products = ref<Product[]>([])
const showProductForm = ref(false)
const editingProductId = ref<number | null>(null)
const productsLoaded = ref(false)

const productForm = reactive<ProductForm>({
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  image: ''
})

onMounted(() => {
  const savedProducts = localStorage.getItem('admin-products')

  if (savedProducts) {
    try {
      products.value = JSON.parse(savedProducts)
    } catch {
      products.value = []
    }
  }

  productsLoaded.value = true
})

watch(
  products,
  (updatedProducts) => {
    if (productsLoaded.value) {
      localStorage.setItem(
        'admin-products',
        JSON.stringify(updatedProducts)
      )
    }
  },
  { deep: true }
)

const resetForm = () => {
  productForm.name = ''
  productForm.description = ''
  productForm.category = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.image = ''
}

const openAddForm = () => {
  editingProductId.value = null
  resetForm()
  showProductForm.value = true
}

const openEditForm = (product: Product) => {
  editingProductId.value = product.id

  productForm.name = product.name
  productForm.description = product.description
  productForm.category = product.category
  productForm.price = product.price
  productForm.stock = product.stock
  productForm.image = product.image

  showProductForm.value = true
}

const closeProductForm = () => {
  showProductForm.value = false
  editingProductId.value = null
  resetForm()
}

const saveProduct = () => {
  if (editingProductId.value === null) {
    const newProduct: Product = {
      id: Date.now(),
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      image: productForm.image
    }

    products.value.push(newProduct)
  } else {
    const product = products.value.find(
      (item) => item.id === editingProductId.value
    )

    if (product) {
      product.name = productForm.name
      product.description = productForm.description
      product.category = productForm.category
      product.price = Number(productForm.price)
      product.stock = Number(productForm.stock)
      product.image = productForm.image
    }
  }

  closeProductForm()
}

const deleteProduct = (product: Product) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${product.name}"?`
  )

  if (!confirmed) return

  products.value = products.value.filter(
    (item) => item.id !== product.id
  )
}

const getStockColor = (stock: number) => {
  if (stock === 0) {
    return 'bg-red-100 text-red-700'
  }

  if (stock < 5) {
    return 'bg-yellow-100 text-yellow-700'
  }

  return 'bg-green-100 text-green-700'
}
</script>
