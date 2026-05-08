<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation Bar -->
   <nav class="bg-gradient-to-r from-blue-900 to-violet-700 text-white px-6 py-4 flex justify-between items-center">
  <a href="/" class="font-bold text-xl flex items-center gap-2">
    Skyscraper Comics
    <img src="/images/logo/Skyscraper_Logo.png" alt="Skyscraper Comics Logo" class="h-8 w-auto" />
  </a>


      <!-- Search Bar -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 fill-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search comics, cards..."
            class="w-full rounded-lg bg-blue-800 border border-blue-700 py-2 pl-9 pr-4 text-sm text-white placeholder:text-blue-300 focus:outline-none focus:border-white focus:bg-blue-700 transition-colors"
          />
        </div>
      </div>

      <div class="flex gap-6 items-center">
    <RouterLink to="/" v-slot="{isExactActive}">
      <span
        :class="[
          'px-4 py-2 rounded-lg transition',
          isExactActive 
            ? 'bg-white text-blue-900'
            : 'hover:bg-blue-800'
        ]"
      >
      Home
      </span>
    </RouterLink>
    <RouterLink to="/products/comics" v-slot="{route}">
      <span
        :class="[
          'px-4 py-2 rounded-lg transition',
          currentRoute.path.startsWith('/products')
            ? 'bg-white text-blue-900' 
            : 'hover:bg-blue-800'
        ]"
      >
      Products
      </span>
    </RouterLink>
    <RouterLink to="/events" v-slot="{isActive}">
      <span
        :class="[
          'px-4 py-2 rounded-lg transition',
          isActive 
            ? 'bg-white text-blue-900' 
            : 'hover:bg-blue-800'
        ]"
      >
      Events
      </span>
    </RouterLink>
    <RouterLink
      to="/admin"
      class="border border-white px-3 py-1 rounded hover:bg-white hover:text-blue-900 text-white transition"
    >
      Admin Sign In
    </RouterLink>
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
import { ref } from 'vue'
import AppFooter from './AppFooter.vue'
import { useRoute } from 'vue-router'

const currentRoute = useRoute()
const searchQuery = ref('')
</script>
