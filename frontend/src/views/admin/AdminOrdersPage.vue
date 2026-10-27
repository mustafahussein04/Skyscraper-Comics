<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">Management area</p>
      <h2 class="mt-2 text-3xl font-bold text-gray-900">Orders</h2>
      <p class="mt-3 max-w-2xl text-gray-600">Active reservations awaiting customer pickup.</p>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search by confirmation #"
        class="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        @input="fetchOrders"
      />
    </div>

    <p v-if="loading" class="text-sm text-gray-500">Loading orders…</p>
    <p v-else-if="errorMessage" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{{ errorMessage }}</p>

    <div v-else-if="orders.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p class="font-semibold text-gray-700">No active reservations</p>
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-200">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th class="px-4 py-3">Confirmation #</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Item</th>
            <th class="px-4 py-3">Created</th>
            <th class="px-4 py-3">Time Remaining</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="px-4 py-4 font-bold tracking-widest text-blue-900">{{ order.confirmationNumber }}</td>
            <td class="px-4 py-4 text-gray-900">{{ order.firstName }} {{ order.lastName }}</td>
            <td class="px-4 py-4 text-gray-600">{{ formatPhone(order.phoneNumber) }}</td>
            <td class="px-4 py-4 text-gray-900">{{ order.productName }}</td>
            <td class="px-4 py-4 text-gray-500">{{ formatDate(order.reservedAt) }}</td>
            <td class="px-4 py-4">
              <span
                :class="[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  timeRemaining(order.expiresAt).urgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                ]"
              >
                {{ timeRemaining(order.expiresAt).label }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Reservation } from '@/types/reservation'
import { getReservations } from '@/services/api'

const orders = ref<Reservation[]>([])
const loading = ref(true)
const errorMessage = ref('')
const search = ref('')

const fetchOrders = async () => {
  try {
    orders.value = await getReservations(search.value.trim() || undefined)
  } catch {
    errorMessage.value = 'Failed to load orders. Is the backend running?'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  return digits
}

function timeRemaining(expiresAt: string): { label: string; urgent: boolean } {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return { label: 'Expired', urgent: true }
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const urgent = hours < 4
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  return { label, urgent }
}
</script>
