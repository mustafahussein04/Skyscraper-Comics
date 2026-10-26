<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-gradient-to-r from-blue-900 to-violet-700 p-6 text-white sm:p-8">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-200">
        Dashboard home
      </p>
      <h2 class="text-3xl font-bold">Welcome to the admin dashboard</h2>
      <p class="mt-3 max-w-2xl text-blue-100">
        Use the sidebar to move between management areas.
      </p>
    </section>

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

    <section aria-labelledby="quick-links-heading">
      <h2 id="quick-links-heading" class="mb-4 text-xl font-bold text-gray-900">Quick links</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.path"
          :to="link.path"
          class="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-gray-900 group-hover:text-violet-700">{{ link.label }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ link.description }}</p>
            </div>
            <span class="text-xl text-violet-600" aria-hidden="true">&rarr;</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getEvents, getProducts, getReservations } from '@/services/api'

import type { Product } from '@/types/product'
import type { AdminEvent } from '@/data/events'
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
  {
    label: 'Customers',
    value: 0,
    valueLabel: 'customer data unavailable',
    attentionCount: 0,
    attentionLabel: '',
    attentionText: 'Customer API not yet available',
    path: '/admin/customers',
  },
])

const quickLinks = [
  { label: 'Manage products', path: '/admin/products', description: 'Open the product workspace' },
  { label: 'Review orders', path: '/admin/orders', description: 'Open the order workspace' },
  { label: 'Manage events', path: '/admin/events', description: 'Open the event workspace' },
  { label: 'View customers', path: '/admin/customers', description: 'Open the customer workspace' },
]

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
