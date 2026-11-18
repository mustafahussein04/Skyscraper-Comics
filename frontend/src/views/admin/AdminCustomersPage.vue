<template>
  <div class="space-y-6">

    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">Analytics</p>
        <h2 class="mt-1 text-3xl font-bold text-gray-900">Customers</h2>
        <p class="mt-1 text-gray-500 text-sm">Live stats tracked from visitor activity on the public site.</p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        :disabled="loading"
        @click="load"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-500">{{ stat.label }}</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-lg" :class="stat.iconBg">
            <component :is="stat.icon" class="w-5 h-5" :class="stat.iconColor" />
          </span>
        </div>
        <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
        <p class="mt-1 text-xs text-gray-400">{{ stat.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">

      <!-- Top pages -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-5 py-4">
          <h3 class="font-semibold text-gray-900">Top Pages</h3>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-if="data?.topPages?.length === 0"
            class="px-5 py-8 text-center text-sm text-gray-400"
          >
            No visits recorded yet.
          </div>
          <div
            v-for="page in data?.topPages"
            :key="page.path"
            class="flex items-center justify-between px-5 py-3"
          >
            <span class="text-sm font-mono text-gray-700 truncate">{{ page.path }}</span>
            <span class="ml-4 shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
              {{ page.visits }} visit{{ page.visits !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent visits -->
      <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-5 py-4">
          <h3 class="font-semibold text-gray-900">Recent Visits</h3>
        </div>
        <div class="divide-y divide-gray-100 max-h-72 overflow-y-auto">
          <div
            v-if="data?.recentVisits?.length === 0"
            class="px-5 py-8 text-center text-sm text-gray-400"
          >
            No visits recorded yet.
          </div>
          <div
            v-for="(visit, i) in data?.recentVisits"
            :key="i"
            class="flex items-center justify-between px-5 py-2.5"
          >
            <span class="text-sm font-mono text-gray-700 truncate">{{ visit.path }}</span>
            <div class="ml-4 shrink-0 flex items-center gap-3 text-xs text-gray-400">
              <span>{{ formatDuration(visit.duration_seconds) }}</span>
              <span>{{ formatDate(visit.visited_at) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BarChart2, Clock, ShoppingBag, MousePointerClick, RefreshCw } from 'lucide-vue-next'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

interface AnalyticsSummary {
  totalVisits: number
  avgTimeSec: number
  productsReserved: number
  eventLinkClicks: number
  topPages: { path: string; visits: number }[]
  recentVisits: { path: string; duration_seconds: number; visited_at: string }[]
}

const data = ref<AnalyticsSummary | null>(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${BASE}/api/analytics`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data.value = await res.json()
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load analytics.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatDuration(secs: number) {
  if (!secs) return '—'
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const stats = computed(() => [
  {
    label: 'Total Site Visits',
    value: data.value?.totalVisits ?? '—',
    sub: 'All-time page views',
    icon: BarChart2,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Avg Time on Page',
    value: data.value != null ? formatDuration(data.value.avgTimeSec) : '—',
    sub: 'Across all tracked pages',
    icon: Clock,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Products Reserved',
    value: data.value?.productsReserved ?? '—',
    sub: 'All-time reservations',
    icon: ShoppingBag,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: 'Event Link Clicks',
    value: data.value?.eventLinkClicks ?? '—',
    sub: 'Registration link clicks',
    icon: MousePointerClick,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
])
</script>
