<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">Management area</p>
        <h2 class="mt-2 text-3xl font-bold text-gray-900">Events</h2>
        <p class="mt-3 max-w-2xl text-gray-600">
          Create, edit, and manage upcoming store events, tournaments, and game nights.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
        @click="addingEvent = true"
      >
        <Plus class="h-5 w-5" aria-hidden="true" />
        Add new Event
      </button>
    </div>

    <p v-if="errorMessage" role="alert" class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
      {{ errorMessage }}
    </p>

    <p v-if="loading" class="text-sm text-gray-500">Loading events…</p>

    <!-- Upcoming events list -->
    <div v-else class="space-y-4">
      <article
        v-for="event in upcomingEvents"
        :key="event.id"
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div class="flex gap-4">
          <!-- Event image, or monogram fallback -->
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
          />
          <div
            v-else
            class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-violet-700"
          >
            <span class="text-2xl font-bold text-white">{{ event.title.charAt(0) }}</span>
          </div>

          <div class="flex min-w-0 flex-1 flex-col">
            <h3 class="font-bold text-gray-900">{{ event.title }}</h3>
            <p class="mt-3 text-sm text-gray-500">{{ event.description }}</p>

            <div class="mt-auto flex items-center justify-between gap-2 pt-2">
              <p class="text-xs font-medium text-violet-600">{{ formatEventDate(event.date) }} · {{ event.time }}</p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  :aria-label="`Edit ${event.title}`"
                  @click="editingEvent = event"
                >
                  <Pencil class="h-4 w-4" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  :aria-label="`Delete ${event.title}`"
                  @click="handleDelete(event)"
                >
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div v-if="upcomingEvents.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p class="font-semibold text-gray-700">No upcoming events</p>
      </div>
    </div>

    <!-- Edit modal (also used for adding — id === 0 means new) -->
    <AdminEventEditModal
      v-if="editingEvent !== null || addingEvent"
      :event="editingEvent ?? blankEvent()"
      @close="editingEvent = null; addingEvent = false"
      @save="handleModalSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { AdminEvent } from '@/data/events'
import AdminEventEditModal from '@/components/admin/AdminEventEditModal.vue'
import { getEvents, createEvent, updateEvent, deleteEvent as apiDeleteEvent } from '@/services/api'

const loading = ref(true)
const errorMessage = ref('')
const events = ref<AdminEvent[]>([])

onMounted(async () => {
  events.value = await getEvents()
})
const editingEvent = ref<AdminEvent | null>(null)
const addingEvent = ref(false)

onMounted(async () => {
  try {
    events.value = await getEvents()
  } catch {
    errorMessage.value = 'Failed to load events. Is the backend running?'
  } finally {
    loading.value = false
  }
})

const blankEvent = (): AdminEvent => ({
  id: 0,
  title: '',
  description: '',
  date: '',
  category: '',
  time: '',
  game: '',
  capacity: '',
  entryFee: '',
  registrationLink: '',
})

const getLocalToday = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
}

const validateEvent = (event: AdminEvent): string | null => {
  if (!event.title.trim()) return 'Enter an event title.'
  if (!event.date || !isValidDate(event.date)) return 'Enter a valid event date.'
  const time = event.time.trim()
  const timePattern =
    /^(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)|(?:[01]\d|2[0-3]):[0-5]\d)(?:\s*[-–]\s*(?:(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)|(?:[01]\d|2[0-3]):[0-5]\d))?$/i

  if (!timePattern.test(time)) {
    return 'Enter a time or range, such as 2:00 PM - 5:00 PM.'
}

  if (event.capacity.trim()) {
    const capacity = Number(event.capacity)
    if (!Number.isInteger(capacity) || capacity <= 0) {
      return 'Capacity must be a positive whole number.'
    }
  }

  if (event.entryFee.trim()) {
    const entryFee = Number(event.entryFee)
    if (!Number.isFinite(entryFee) || entryFee < 0) {
      return 'Entry fee must be zero or greater.'
    }
  }

  return null
}

const upcomingEvents = computed(() => {
  const today = getLocalToday()

  return events.value
    .filter(event => isValidDate(event.date) && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const handleModalSave = async (updated: AdminEvent) => {
  errorMessage.value = ''

  const validationError = validateEvent(updated)
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  try {
    if (updated.id === 0) {
      const { id: _id, ...data } = updated
      const created = await createEvent(data)
      events.value.push(created)
      addingEvent.value = false
    } else {
      const { id, ...data } = updated
      const saved = await updateEvent(id, data)
      events.value = events.value.map(event =>
        event.id === saved.id ? saved : event
      )
      editingEvent.value = null
    }
  } catch (err) {
    errorMessage.value = err instanceof Error
      ? err.message
      : 'Failed to save event.'
  }
}

const handleDelete = async (event: AdminEvent) => {
  if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
  try {
    await apiDeleteEvent(event.id)
    events.value = events.value.filter(e => e.id !== event.id)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to delete event.'
  }
}


const formatEventDate = (iso: string) => {
  const date = new Date(iso + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>
