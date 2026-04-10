<template>
  <div>

    <!-- Navigation Bar -->
   <nav class="bg-gradient-to-r from-blue-900 to-violet-700 text-white px-6 py-4 flex justify-between items-center">
  <a href="/" class="font-bold text-xl flex items-center gap-2">
    Skyscraper Comics
    <img src="/images/logo/Skyscraper Logo.jpg" alt="Skyscraper Comics Logo" class="h-8 w-auto" />
  </a>
  <div class="flex gap-6 items-center">
    <RouterLink
      to="/"
      class="px-4 py-2 rounded-lg"
      exact-active-class="bg-white text-blue-900"
    >
      Home
    </RouterLink>
    <RouterLink
      to="/products"
      class="px-4 py-2 rounded-lg"
      active-class="bg-white text-blue-900"
    >
      Products
    </RouterLink>
    <RouterLink
      to="/events"
      class="px-4 py-2 rounded-lg"
      active-class="bg-white text-blue-900"
    >
      Events
    </RouterLink>
    <RouterLink
      to="/admin"
      class="border border-white px-3 py-1 rounded hover:bg-white hover:text-blue-900 text-white transition"
    >
      Admin Sign In
    </RouterLink>
  </div>
</nav>

    <!-- Front Banner -->
    <section class="bg-blue-950 text-white px-6 py-24">
      <h1 class="text-5xl font-bold mb-4">Welcome to Skyscraper Comics</h1>
      <p class="text-lg mb-8 text-gray-300">Discover your next favorite comic book or master your favorite trading card game.</p>
      <div class="flex gap-4">
        <a href="/products" class="bg-white text-blue-900 font-semibold px-6 py-3 rounded hover:bg-gray-100">Shop Products</a>
        <a href="/events" class="border border-white px-6 py-3 rounded hover:bg-white hover:text-blue-900">View Events</a>
      </div>
    </section>

    <!-- Why Shop With Us -->
    <section class="px-6 py-16 bg-white">
      <h2 class="text-3xl font-bold text-center mb-10">Why Shop With Us</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div class="text-center p-4">
          <h3 class="font-bold text-lg mb-2">Vast Selection</h3>
          <p class="text-gray-600 text-sm">Browse thousands of comics and trading cards from all major publishers.</p>
        </div>
        <div class="text-center p-4">
          <h3 class="font-bold text-lg mb-2">Weekly Events</h3>
          <p class="text-gray-600 text-sm">Game nights, tournaments, and special release events every week.</p>
        </div>
        <div class="text-center p-4">
          <h3 class="font-bold text-lg mb-2">Community</h3>
          <p class="text-gray-600 text-sm">Connect with fellow collectors and players in a friendly environment.</p>
        </div>
        <div class="text-center p-4">
          <h3 class="font-bold text-lg mb-2">Tournaments</h3>
          <p class="text-gray-600 text-sm">Compete in organized play for Magic, Pokemon, Yu-Gi-Oh!, and more.</p>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="px-6 py-16 bg-gray-100">
      <h2 class="text-3xl font-bold text-center mb-10">Featured Categories</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div class="bg-white rounded-lg p-8 shadow">
          <h3 class="font-bold text-xl mb-2">Comic Books</h3>
          <p class="text-gray-600">New releases, back issues, and rare finds</p>
        </div>
        <div class="bg-white rounded-lg p-8 shadow">
          <h3 class="font-bold text-xl mb-2">Trading Cards</h3>
          <p class="text-gray-600">Magic, Pokemon, Yu-Gi-Oh!, and more</p>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="px-6 py-16 bg-white">
      <h2 class="text-3xl font-bold text-center mb-10">Upcoming Events</h2>
      <div class="max-w-2xl mx-auto flex flex-col gap-4 mb-8">
        <div v-for="event in events" :key="event.title" class="bg-gray-100 rounded-lg p-6">
          <h3 class="font-bold text-lg">{{ event.title }}</h3>
          <p class="text-gray-600 text-sm">{{ event.desc }}</p>
          <p class="text-gray-500 text-sm mt-1">{{ event.time }}</p>
        </div>
      </div>
      <div class="text-center">
        <a href="/events" class="bg-blue-900 text-white px-8 py-3 rounded hover:bg-blue-800">View Full Calendar</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
        <div>
          <h4 class="font-bold mb-2">Skyscraper Comics</h4>
          <p class="text-gray-400 text-sm">Here in Natomas for your Comic and Trading Card game needs! Buy • Sell • Trade!!</p>
        </div>
        <div>
          <h4 class="font-bold mb-2">Hours</h4>
          <p class="text-gray-400 text-sm">Mon-Fri: 11am - 8pm</p>
          <p class="text-gray-400 text-sm">Sat-Sun: 10am - 9pm</p>
        </div>
        <div>
          <h4 class="font-bold mb-2">Contact</h4>
          <p class="text-gray-400 text-sm">123 Comic Street</p>
          <p class="text-gray-400 text-sm">(555) 123-4567</p>
          <p class="text-gray-400 text-sm">info@skyscrapercomics.com</p>
        </div>
      </div>
      <p class="text-center text-gray-500 text-sm">© 2026 Skyscraper Comics. All rights reserved.</p>
    </footer>

  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
const events = [
  { title: 'Dummy Event #1', desc: 'Standard format tournament. Entry fee: $5', time: 'Mar 7 | 7:00 PM - 10:00 PM' },
  { title: 'Dummy Event #2', desc: 'Casual play and trading session for all ages', time: 'Mar 8 | 2:00 PM - 5:00 PM' },
]
</script>