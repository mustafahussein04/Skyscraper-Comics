<template>
  <div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <img
      :src="product.image"
      :alt="product.name"
      class="w-full h-64 object-cover mb-4"
    >

    <div>
      <div class="flex items-center justify-between">
        <p class="text-sm mb-1 bg-blue-100 text-blue-900 px-2 py-1 rounded capitalize">
          {{ getBrandLabel(product.brand) }}
        </p>

        <p
          class="text-sm mb-1 px-2 py-1 rounded"
          :class="getStockColor(product.stock)"
        >
          {{ getStockLabel(product.stock) }}
        </p>
      </div>

      <h3 class="text-xl font-bold mb-2 line-clamp-2 h-[3em]">
        {{ product.name }}
      </h3>

      <p class="text-sm text-gray-600 mb-2 line-clamp-2 h-[3em]">
        {{ product.description }}
      </p>

      <div class="flex items-center justify-between">
        <p class="text-2xl font-bold">
          ${{ product.price.toFixed(2) }}
        </p>

        <button
          type="button"
          class="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="product.stock === 0"
          @click="openReservationForm"
        >
          {{ product.stock === 0 ? 'Unavailable' : 'Reserve' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Reservation popup -->
  <Teleport to="body">
    <div
      v-if="showReservationForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="closeReservationForm"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b p-6">
          <div>
            <h2 class="text-2xl font-bold">Reserve for Pickup</h2>
            <p class="text-gray-500">In-store pickup only</p>
          </div>

          <button
            type="button"
            class="text-3xl text-gray-500 hover:text-black"
            aria-label="Close reservation form"
            @click="closeReservationForm"
          >
            &times;
          </button>
        </div>

        <form class="p-6" @submit.prevent="submitReservation">
          <!-- Product information -->
          <div class="mb-6 rounded-lg border border-blue-300 bg-blue-50 p-4">
            <h3 class="text-lg font-bold">
              {{ product.name }}
            </h3>

            <p class="text-2xl font-bold text-blue-900">
              ${{ product.price.toFixed(2) }}
            </p>
          </div>

          <div class="mb-4">
            <label for="firstName" class="mb-1 block font-medium text-gray-700">
              First Name
            </label>

            <input
              id="firstName"
              v-model.trim="reservation.firstName"
              type="text"
              placeholder="John"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
          </div>

          <div class="mb-4">
            <label for="lastName" class="mb-1 block font-medium text-gray-700">
              Last Name
            </label>

            <input
              id="lastName"
              v-model.trim="reservation.lastName"
              type="text"
              placeholder="Doe"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
          </div>

          <div class="mb-4">
            <label for="phoneNumber" class="mb-1 block font-medium text-gray-700">
              Phone Number
            </label>

            <input
              id="phoneNumber"
              v-model.trim="reservation.phoneNumber"
              type="tel"
              placeholder="(555) 123-4567"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-3
                     outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            >
          </div>

          <div class="mb-4 rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
            <p class="font-bold">Pickup Information:</p>
            <p>
              We will hold your item for 48 hours. You’ll receive confirmation
              once your reservation is ready for pickup at our store.
            </p>
          </div>

          <p
            v-if="reservationSubmitted"
            class="mb-4 rounded-lg bg-green-100 p-3 text-green-900"
          >
            Your reservation has been submitted!
          </p>

          <button
            type="submit"
            class="w-full rounded-lg bg-blue-900 px-4 py-3 font-bold text-white
                   hover:bg-blue-800"
          >
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Product } from '@/types/product'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  reserved: [
    reservation: {
      product: Product
      firstName: string
      lastName: string
      phoneNumber: string
    }
  ]
}>()

const showReservationForm = ref(false)
const reservationSubmitted = ref(false)

const reservation = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: ''
})

const openReservationForm = () => {
  if (props.product.stock > 0) {
    reservationSubmitted.value = false
    showReservationForm.value = true
  }
}

const closeReservationForm = () => {
  showReservationForm.value = false
}

const submitReservation = () => {
  emit('reserved', {
    product: props.product,
    firstName: reservation.firstName,
    lastName: reservation.lastName,
    phoneNumber: reservation.phoneNumber
  })

  reservationSubmitted.value = true

  reservation.firstName = ''
  reservation.lastName = ''
  reservation.phoneNumber = ''
}

const getStockColor = (stock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-900'
  if (stock < 5) return 'bg-yellow-100 text-yellow-900'
  return 'bg-green-100 text-green-900'
}

const getStockLabel = (stock: number) => {
  if (stock === 0) return 'Out of Stock'
  if (stock < 5) return `Limited: ${stock}`
  return `In Stock: ${stock}`
}

const getBrandLabel = (brand: string) => {
  if (brand === 'Pokemon') return 'Pokémon'
  return brand
}
</script>