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

    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p class="font-semibold text-gray-700">Event list coming soon</p>
      <p class="mt-2 text-sm text-gray-500">
        Existing events will appear here with edit and delete controls.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
</script>
