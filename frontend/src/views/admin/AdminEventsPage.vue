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

      <!-- SCRUM-83: Add new Events button -->
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800"
      >
        <Plus class="h-5 w-5" aria-hidden="true" />
        Add new Event
      </button>
    </div>

    <!-- SCRUM-84: Upcoming events list with edit buttons -->
    <div class="space-y-4">
      <article
        v-for="event in upcomingEvents"
        :key="event.id"
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div class="flex gap-4">
          <!-- Event image, or monogram fallback from title's first letter -->
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
            <p class="mt-1 text-sm text-gray-500">{{ event.description }}</p>

            <div class="mt-auto flex items-center justify-end gap-2 pt-3">
              <!-- SCRUM-84: Edit button (stubbed until SCRUM-86) -->
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                :aria-label="`Edit ${event.title}`"
              >
                <Pencil class="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </article>

      <div v-if="upcomingEvents.length === 0" class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p class="font-semibold text-gray-700">No upcoming events</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Plus } from 'lucide-vue-next'
import { adminEvents } from '@/data/events'

// SCRUM-84: only events that haven't happened yet
const upcomingEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return adminEvents.filter(event => event.date >= today)
})
</script>