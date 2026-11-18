<template>
  <div class="space-y-8">

    <section aria-labelledby="overview-heading">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 id="overview-heading" class="text-xl font-bold text-gray-900">At a glance</h2>
          <p class="mt-1 text-sm text-gray-500">
            <span v-if="lastUpdated">Updated {{ formattedLastUpdated }}</span>
            <span v-else>Live admin stats</span>
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="loadStats"
        >
          {{ isLoading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p>{{ errorMessage }}</p>
          <button type="button" class="font-semibold underline" @click="loadStats">Try again</button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in overviewItems"
          :key="item.label"
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ item.label }}</p>
              <p class="mt-2 text-3xl font-bold text-gray-900">
                <span v-if="isInitialLoading" class="inline-block h-9 w-16 animate-pulse rounded bg-gray-200" />
                <span v-else>{{ Intl.NumberFormat().format(item.value) }}</span>
              </p>
            </div>

            <RouterLink
              :to="item.path"
              class="text-sm font-semibold text-violet-700 hover:text-violet-900"
              :aria-label="`Open ${item.label.toLowerCase()}`"
            >
              View
            </RouterLink>
          </div>

          <p class="mt-2 text-sm text-gray-500">{{ item.valueLabel }}</p>
          <p
            class="mt-3 text-sm font-medium"
            :class="item.attentionCount > 0 ? 'text-amber-700' : 'text-emerald-700'"
          >
            <template v-if="isInitialLoading">Loading attention items…</template>
            <template v-else-if="item.attentionCount > 0">
              {{ Intl.NumberFormat().format(item.attentionCount) }} {{ item.attentionLabel }}
            </template>
            <template v-else>No immediate attention needed</template>
          </p>
        </article>
      </div>
    </section>

    <!-- Products preview -->
    <section aria-labelledby="products-heading">
      <div class="mb-4 flex items-center justify-between">
        <h2 id="products-heading" class="text-xl font-bold text-gray-900">Products</h2>
        <RouterLink to="/admin/products" class="text-sm font-semibold text-violet-700 hover:text-violet-900">
          View all
        </RouterLink>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div v-if="isInitialLoading" class="p-6 text-sm text-gray-400">Loading…</div>
        <div v-else-if="products.length === 0" class="p-6 text-sm text-gray-400">No products in the catalog yet.</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th class="px-5 py-3">Product</th>
              <th class="px-5 py-3">Type</th>
              <th class="px-5 py-3">Price</th>
              <th class="px-5 py-3">Stock</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="product in previewProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-5 py-3 font-medium text-gray-900">{{ product.name }}</td>
              <td class="px-5 py-3 capitalize text-gray-500">{{ product.type }}</td>
              <td class="px-5 py-3 text-gray-700">${{ product.price.toFixed(2) }}</td>
              <td class="px-5 py-3">
                <span
                  class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'"
                >
                  {{ product.stock === 0 ? 'Out of stock' : product.stock }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Upcoming events preview -->
    <section aria-labelledby="events-heading">
      <div class="mb-4 flex items-center justify-between">
        <h2 id="events-heading" class="text-xl font-bold text-gray-900">Upcoming Events</h2>
        <RouterLink to="/admin/events" class="text-sm font-semibold text-violet-700 hover:text-violet-900">
          View all
        </RouterLink>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div v-if="isInitialLoading" class="p-6 text-sm text-gray-400">Loading…</div>
        <div v-else-if="upcomingEvents.length === 0" class="p-6 text-sm text-gray-400">No upcoming events scheduled.</div>
        <table v-else class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th class="px-5 py-3">Event</th>
              <th class="px-5 py-3">Date</th>
              <th class="px-5 py-3">Category</th>
              <th class="px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="event in upcomingEvents" :key="event.id" class="hover:bg-gray-50">
              <td class="px-5 py-3 font-medium text-gray-900">{{ event.title }}</td>
              <td class="px-5 py-3 text-gray-700">{{ formatEventDate(event.date) }}</td>
              <td class="px-5 py-3 text-gray-500">{{ event.category || '—' }}</td>
              <td class="px-5 py-3 text-gray-500">{{ event.time || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getEvents, getProducts, getReservations } from '@/services/api'

import type { Product } from '@/types/product'
import type { AdminEvent } from '@/types/event'
import type { Reservation } from '@/types/reservation'

const products = ref<Product[]>([])
const events = ref<AdminEvent[]>([])
const reservations = ref<Reservation[]>([])

const AUTO_REFRESH_MS = 60_000

const isLoading = ref(false)
const hasLoaded = ref(false)
const errorMessage = ref('')
const lastUpdated = ref<Date | null>(null)

let refreshTimer: ReturnType<typeof setInterval> | undefined

const isInitialLoading = computed(() => 
  isLoading.value && !hasLoaded.value
)

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return ''
  return lastUpdated.value.toLocaleString()
})

const today = computed(() => {
  const now = new Date()

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
})

const eventsToday = computed(() => {
  return events.value.filter((event) => {
    return event.date === today.value
  }).length
})

const overviewItems = computed(() => [
  {
    label: 'Products',
    value: products.value.length,
    valueLabel: 'products in the catalog',
    attentionCount: 0,
    attentionLabel: '',
    attentionText: 'Catalog loaded',
    path: '/admin/products',
  },
  {
    label: 'Orders',
    value: reservations.value.length,
    valueLabel: 'reservations',
    attentionCount: 0,
    attentionLabel: '',
    attentionText: 'Reservation activity',
    path: '/admin/orders',
  },
  {
    label: 'Events',
    value: events.value.length,
    valueLabel: 'events',
    attentionCount: eventsToday.value,
    attentionLabel:
      eventsToday.value === 1
        ? 'event today'
        : 'events today',
    attentionText: '',
    path: '/admin/events',
  },
])

const previewProducts = computed(() => products.value.slice(0, 5))

const upcomingEvents = computed(() =>
  events.value
    .filter(e => e.date >= today.value)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
)

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

async function loadStats() {
  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [
      productData,
      eventData,
      reservationData,
    ] = await Promise.all([
      getProducts(),
      getEvents(),
      getReservations(),
    ])

    products.value = productData
    events.value = eventData
    reservations.value = reservationData

    hasLoaded.value = true
    lastUpdated.value = new Date()
  } catch (error) {
    console.error(
      'Unable to load admin dashboard stats:',
      error
    )

    errorMessage.value = hasLoaded.value
      ? 'Could not refresh the dashboard. Showing the most recent available data.'
      : 'Could not load dashboard statistics. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadStats()

  refreshTimer = setInterval(
    () => void loadStats(),
    AUTO_REFRESH_MS
  )
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>
