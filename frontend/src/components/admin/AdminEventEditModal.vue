<template>
  <!-- Backdrop — click outside closes -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4"
    @click.self="$emit('close')"
  >
    <!-- Floating centered edit window -->
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-violet-600">Edit event</p>
          <h3 class="mt-1 text-xl font-bold text-gray-900">{{ draft.title }}</h3>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
          @click="$emit('close')"
        >
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="save">
        <div>
          <label class="block text-sm font-medium text-gray-700" for="edit-title">Title</label>
          <input
            id="edit-title"
            v-model="draft.title"
            type="text"
            required
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-date">Date</label>
            <input
              id="edit-date"
              v-model="draft.date"
              type="date"
              required
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-time">Time</label>
            <input
              id="edit-time"
              v-model="draft.time"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-category">Category</label>
            <!-- SCRUM-167: dropdown from the shared categories config — used by both Add and Edit -->
            <select
              id="edit-category"
              v-model="draft.category"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">— No category —</option>
              <!-- Preserve legacy categories (e.g. Tournament/Casual Play) so editing an old event doesn't silently wipe its category -->
              <option v-if="hasLegacyCategory" :value="draft.category">{{ draft.category }} (legacy)</option>
              <option v-for="cat in EVENT_CATEGORIES" :key="cat.name" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-game">Game</label>
            <input
              id="edit-game"
              v-model="draft.game"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-capacity">Capacity</label>
            <input
              id="edit-capacity"
              v-model="draft.capacity"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700" for="edit-entryfee">Entry Fee</label>
            <input
              id="edit-entryfee"
              v-model="draft.entryFee"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="edit-description">Description</label>
          <textarea
            id="edit-description"
            v-model="draft.description"
            rows="4"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <!-- SCRUM-87: "Update Event" on edit; create-mode modal keeps an accurate label -->
            {{ isNew ? 'Create Event' : 'Update Event' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { X } from 'lucide-vue-next'
import type { AdminEvent } from '@/data/events'
import { EVENT_CATEGORIES } from '@/config/eventCategories'

const props = defineProps<{
  event: AdminEvent
}>()

const emit = defineEmits<{
  close: []
  save: [updated: AdminEvent]
}>()

// Work on a draft copy — Cancel discards, Save writes back
const draft = reactive({ ...props.event })

// SCRUM-87: id === 0 means the page opened this modal in "add new" mode
const isNew = computed(() => props.event.id === 0)

// SCRUM-167: keep legacy categories selectable so editing an old event doesn't wipe its category
const hasLegacyCategory = computed(() =>
  draft.category !== '' && !EVENT_CATEGORIES.some(cat => cat.name === draft.category)
)

const save = () => {
  emit('save', { ...draft })
}
</script>

<style scoped>
/* Pin the native calendar icon to the right edge instead of floating after the text */
input[type='date']::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 0.75rem;
}

input[type='date'] {
  position: relative;
}
</style>