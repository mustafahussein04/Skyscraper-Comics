<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation Bar -->
    <nav class="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
      <a href="/" class="font-bold text-xl hover:text-gray-200 transition-colors">Skyscraper Comics</a>
      <div class="flex gap-6 items-center">
        <a href="/" class="hover:underline">Home</a>
        <a href="/products" class="hover:underline">Products</a>
        <a href="/events" class="hover:underline">Events</a>
        <a href="/signin" class="border border-white px-3 py-1 rounded hover:bg-white hover:text-blue-900 transition-colors">
          Admin Sign In
        </a>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer on every public page -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from './AppFooter.vue'
</script>
