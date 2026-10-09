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
})

const upcomingEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return events.value
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const handleDelete = async (event: AdminEvent) => {
  if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
  try {
    await apiDeleteEvent(event.id)
    events.value = events.value.filter(e => e.id !== event.id)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to delete event.'
  }
}

const handleModalSave = async (updated: AdminEvent) => {
  errorMessage.value = ''
  try {
    if (updated.id === 0) {
      // Create new
      const { id: _id, ...data } = updated
      const created = await createEvent(data)
      events.value.push(created)
      addingEvent.value = false
    } else {
      // Update existing
      const { id, ...data } = updated
      const saved = await updateEvent(id, data)
      events.value = events.value.map(e => (e.id === saved.id ? saved : e))
      editingEvent.value = null
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to save event.'
  }
}

const formatEventDate = (iso: string) => {
  const date = new Date(iso + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>
