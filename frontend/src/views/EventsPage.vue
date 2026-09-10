<template>
  <div class="min-h-screen bg-white">

    <!-- Page Header -->
    <div class="px-6 pt-10 pb-6 max-w-screen-xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-1">Events Calendar</h1>
      <p class="text-blue-600 text-sm">Join us for tournaments, game nights, and special events</p>
    </div>

    <!-- Two-column layout: calendar left, upcoming events right -->
    <div class="max-w-screen-xl mx-auto px-6 pb-16 flex gap-8 items-start">

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
          <div class="flex flex-col gap-5">
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
          </div>
        </template>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Clock, Gamepad2, Users, DollarSign } from 'lucide-vue-next'

const selectedDate = ref<string | null>(null)

const events = [
  {
    title: 'Magic Commander',
    start: '2026-09-20',
    extendedProps: {
      time: '7:00 PM - 10:00 PM',
      game: 'Magic: The Gathering',
      capacity: '32 players',
      entryFee: '$5',
      description: 'Standard format tournament with prizes for top finishers',
    },
  },
  {
    title: 'Magic Commander',
    start: '2026-09-23',
    extendedProps: {
      time: '7:00 PM - 10:00 PM',
      game: 'Magic: The Gathering',
      capacity: '32 players',
      entryFee: '$5',
      description: 'Standard format tournament with prizes for top finishers',
    },
  },
  {
    title: 'Pokemon League',
    start: '2026-09-23',
    extendedProps: {
      time: '2:00 PM - 5:00 PM',
      game: 'Pokemon TCG',
      capacity: '20 players',
      entryFee: 'Free',
      description: 'Casual Pokemon play for all skill levels. Bring your own deck!',
    },
  },
]

const selectedDayEvents = computed(() =>
  selectedDate.value ? events.filter(e => e.start === selectedDate.value) : []
)

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const handleDateClick = (info: any) => {
  selectedDate.value = info.dateStr
}

const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: '',
    center: 'title',
    right: '',
  },
  contentHeight: 680,
  dateClick: handleDateClick,
  events,
}

const sidebarEvents: { day: string; month: string; title: string; time: string; category: string }[] = []
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

:deep(.fc-button) {
  background: transparent !important;
  border: none !important;
  color: white !important;
  box-shadow: none !important;
  font-size: 1.1rem;
  padding: 4px 10px !important;
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
  background-color: #1e3a8a !important;
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
