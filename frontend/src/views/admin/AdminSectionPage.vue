<template>
  <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <p class="text-sm font-semibold uppercase tracking-widest text-violet-600">Management area</p>
    <h2 class="mt-2 text-3xl font-bold text-gray-900">{{ title }}</h2>
    <p class="mt-3 max-w-2xl text-gray-600">{{ description }}</p>
    <div class="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p class="font-semibold text-gray-700">{{ title }} tools are coming next</p>
      <p class="mt-2 text-sm text-gray-500">
        This page establishes the navigation and layout without adding management actions yet.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
