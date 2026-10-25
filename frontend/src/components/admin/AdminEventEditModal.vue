<template>
  <!-- Backdrop — click outside closes -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4"
    @click.self="$emit('close')"
  >
    <!-- Floating centered edit window -->
    <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-violet-600">{{ draft.id === 0 ? 'Add event' : 'Edit event' }}</p>
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

      <form novalidate class="mt-5 space-y-4" @submit.prevent="save">
        <div>
          <label class="block text-sm font-medium text-gray-700" for="edit-title">Title</label>
          <input
            id="edit-title"
            v-model="draft.title"
            type="text"
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
            <input
              id="edit-category"
              v-model="draft.category"
              type="text"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
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

        <div>
          <label class="block text-sm font-medium text-gray-700" for="edit-registration-link">Registration Link</label>
          <input
            id="edit-registration-link"
            v-model="draft.registrationLink"
            type="url"
            placeholder="https://example.com/register"
            :aria-invalid="Boolean(registrationLinkError)"
            :aria-describedby="registrationLinkError ? 'registration-link-error' : 'registration-link-help'"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          <p v-if="registrationLinkError" id="registration-link-error" role="alert" class="mt-1 text-sm text-red-600">
            {{ registrationLinkError }}
          </p>
          <p v-else id="registration-link-help" class="mt-1 text-sm text-gray-500">
            Optional. Use a URL starting with http:// or https://.
          </p>
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
            {{ draft.id === 0 ? 'Add Event' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { X } from 'lucide-vue-next'
import { isValidRegistrationLink } from '@/utils/registrationLink'
import type { AdminEvent } from '@/data/events'

const props = defineProps<{
  event: AdminEvent
}>()

const emit = defineEmits<{
  close: []
  save: [updated: AdminEvent]
}>()

// Work on a draft copy — Cancel discards, Save writes back
const draft = reactive({ ...props.event, registrationLink: props.event.registrationLink ?? '' })
const registrationLinkError = computed(() =>
  isValidRegistrationLink(draft.registrationLink)
    ? ''
    : 'Enter a valid URL starting with http:// or https://.',
)

const save = () => {
  if (registrationLinkError.value) return
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