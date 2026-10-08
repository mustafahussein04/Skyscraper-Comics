<template>
  <div class="min-h-screen bg-white">

    <!-- Page Header -->
    <div class="px-6 pt-10 pb-6 max-w-screen-xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-1">Events Calendar</h1>
      <p class="text-blue-600 text-sm">Join us for tournaments, game nights, and special events</p>
    </div>

    <!-- Two-row layout: calendar & upcoming events top, event category filtering bottom -->
    <div class="max-w-screen-xl mx-auto px-6 pb-16">

      <!-- Two-column layout: calendar left, upcoming events right -->
      <div class="flex gap-8 items-start">

        <!-- FullCalendar -->
        <div class="flex-1 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <FullCalendar :options="calendarOptions" />
        </div>

        <!-- Sidebar: toggles between Upcoming Events and Day Events -->
        <div class="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-5 overflow-y-auto max-h-[720px]">

          <!-- Day Events Panel -->
          <template v-if="selectedDate && selectedDayEvents.length > 0">
            <p class="text-sm font-bold text-gray-900 mb-4">Events on {{ formattedSelectedDate }}</p>

            <div v-for="(event, index) in selectedDayEvents" :key="event.title">
              <div :class="index > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''">
                <h3 class="text-xl font-bold text-gray-900 mb-4">{{ event.title }}</h3>

                <div class="flex flex-col gap-3 mb-4">
                  <div class="flex items-start gap-3">
                    <Clock class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Time</p>
                      <p class="text-sm text-gray-600">{{ event.extendedProps.time }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <Gamepad2 class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Game</p>
                      <p class="text-sm text-gray-600">{{ event.extendedProps.game }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <Users class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Capacity</p>
                      <p class="text-sm text-gray-600">{{ event.extendedProps.capacity }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <DollarSign class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Entry Fee</p>
                      <p class="text-sm text-gray-600">{{ event.extendedProps.entryFee }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-500">
                  {{ event.extendedProps.description }}
                </div>

                <button class="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-colors">
                  Register for Event
                </button>
              </div>
            </div>

            <div class="text-center mt-6">
              <button @click="selectedDate = null" class="text-blue-600 text-sm hover:underline">
                View all events
              </button>
            </div>
          </template>

          <!-- Upcoming Events Panel -->
          <template v-else>
            <h2 class="text-lg font-bold text-gray-900 mb-5">Upcoming Events</h2>
            <p v-if="loading" class="text-sm text-gray-400">Loading…</p>
            <div v-else class="flex flex-col gap-5">
              <div v-for="event in sidebarEvents" :key="event.title + event.day" class="flex gap-3 items-start">
                <div class="flex-shrink-0 bg-blue-900 text-white rounded text-center w-14 py-2 leading-none">
                  <div class="text-2xl font-bold">{{ event.day }}</div>
                  <div class="text-xs uppercase tracking-wide mt-1">{{ event.month }}</div>
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm leading-snug">{{ event.title }}</p>
                  <p class="text-gray-500 text-xs mt-0.5">{{ event.time }}</p>
                  <p class="text-gray-400 text-xs">{{ event.category }}</p>
                </div>
              </div>
              <p v-if="sidebarEvents.length === 0 && !loading" class="text-sm text-gray-400">No upcoming events.</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Category filters -->
      <div class="mt-5 border border-gray-200 rounded-lg px-5 py-4">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">

          <span class="text-sm font-semibold text-gray-700">
            Event Categories:
          </span>

          <button
            v-for="category in categories"
            :key="category.name"
            type="button"
            class="flex items-center gap-2 text-sm text-gray-700"
            @click="toggleCategory(category.name)"
          >
            <!-- Colored checkbox -->
            <span
              class="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: category.color }"
            >
              <Check
                v-if="selectedCategories.includes(category.name)"
                class="w-3 h-3 text-white"
                :stroke-width="3"
              />
            </span>

            <span>{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- Admin: Manage Events button -->
      <div v-if="isAdmin" class="mt-6 flex justify-center">
        <button
          type="button"
          class="bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          @click="showManageModal = true"
        >
          Manage Events
        </button>
      </div>
    </div>
  </div>

  <!-- Manage Events Modal -->
  <Teleport to="body">
    <div
      v-if="showManageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showManageModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <!-- Modal header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Manage Events</h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="showManageModal = false"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500">{{ calendarEvents.length }} event{{ calendarEvents.length !== 1 ? 's' : '' }} total</p>
            <button
              type="button"
              class="flex items-center gap-2 bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Plus class="w-4 h-4" />
              Add Event
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="event in calendarEvents"
              :key="event.title + event.start"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <p class="font-semibold text-gray-900">{{ event.title }}</p>
                <p class="text-sm text-gray-500">{{ event.start }} &middot; {{ event.extendedProps.category }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-sm font-medium text-blue-700 hover:text-blue-900 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-sm font-medium text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            @click="showManageModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Check, Clock, DollarSign, Gamepad2, Plus, Users, X } from 'lucide-vue-next'
import { isAdminAuthenticated } from '@/composables/useAdminAuth'
import { getEvents } from '@/services/api'
import type { AdminEvent } from '@/data/events'

const isAdmin = isAdminAuthenticated()
const showManageModal = ref(false)
const selectedDate = ref<string | null>(null)
const loading = ref(true)
const rawEvents = ref<AdminEvent[]>([])

onMounted(async () => {
  try {
    rawEvents.value = await getEvents()
  } finally {
    loading.value = false
  }
})

const categories = [
  { name: 'Tournament', color: '#b91c1c' },
  { name: 'Casual Play', color: '#15803d' },
]

const selectedCategories = ref<string[]>([])

const toggleCategory = (category: string) => {
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(item => item !== category)
  } else {
    selectedCategories.value.push(category)
  }
}

const getCategoryColor = (category: string) =>
  categories.find(item => item.name === category)?.color ?? '#1e3a8a'

const calendarEvents = computed(() => {
  const source = selectedCategories.value.length === 0
    ? rawEvents.value
    : rawEvents.value.filter(e => selectedCategories.value.includes(e.category))

  return source.map(e => ({
    title: e.title,
    start: e.date,
    backgroundColor: getCategoryColor(e.category),
    borderColor: getCategoryColor(e.category),
    extendedProps: {
      category: e.category,
      time: e.time,
      game: e.game,
      capacity: e.capacity,
      entryFee: e.entryFee,
      description: e.description,
    },
  }))
})

const selectedDayEvents = computed(() => {
  if (!selectedDate.value) return []
  const matches = rawEvents.value.filter(e => e.date === selectedDate.value)
  if (selectedCategories.value.length === 0) return matches.map(toCalendarEvent)
  return matches
    .filter(e => selectedCategories.value.includes(e.category))
    .map(toCalendarEvent)
})

function toCalendarEvent(e: AdminEvent) {
  return {
    title: e.title,
    start: e.date,
    extendedProps: {
      category: e.category,
      time: e.time,
      game: e.game,
      capacity: e.capacity,
      entryFee: e.entryFee,
      description: e.description,
    },
  }
}

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const handleDateClick = (info: any) => {
  selectedDate.value = info.dateStr
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  contentHeight: 680,
  dateClick: handleDateClick,
  events: calendarEvents.value,
}))

const sidebarEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return rawEvents.value
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const d = new Date(e.date + 'T00:00:00')
      return {
        day: d.getDate().toString(),
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        title: e.title,
        time: e.time,
        category: e.category,
      }
    })
})
</script>

<style scoped>
/* Header toolbar - dark blue bar */
:deep(.fc-header-toolbar) {
  background-color: #1e3a8a;
  padding: 14px 20px;
  margin-bottom: 0 !important;
}

:deep(.fc-toolbar-title) {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

:deep(.fc-button:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
}

:deep(.fc-button:focus) {
  box-shadow: none !important;
}

/* Day name headers */
:deep(.fc-col-header-cell) {
  background: white;
  padding: 10px 0;
  border-color: #e5e7eb;
}

:deep(.fc-col-header-cell-cushion) {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
}

/* Day cells */
:deep(.fc-daygrid-day) {
  border-color: #e5e7eb;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 110px;
}

:deep(.fc-daygrid-day-number) {
  color: #374151;
  font-size: 0.875rem;
  text-decoration: none;
  padding: 6px 10px;
}

/* Today highlight */
:deep(.fc-day-today) {
  background-color: #eff6ff !important;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  color: #1e3a8a;
  font-weight: 700;
}

/* Event pills */
:deep(.fc-daygrid-event) {
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  margin-bottom: 2px !important;
}

:deep(.fc-event-title) {
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Grid borders */
:deep(.fc-scrollgrid) {
  border-color: #e5e7eb !important;
}

:deep(.fc-scrollgrid td),
:deep(.fc-scrollgrid th) {
  border-color: #e5e7eb !important;
}
</style>
