<template>
  <div>

    <!-- Hero Banner -->
    <section class="bg-blue-950 text-white px-6 py-24">
      <div class="max-w-5xl mx-auto">
        <h1 class="text-5xl font-bold mb-4">Welcome to Skyscraper Comics</h1>
        <p class="text-lg mb-8 text-gray-300 max-w-xl">
          Discover your next interests in comic books or your favorite trading card game.
        </p>
        <div class="flex gap-4">
          <a href="/products" class="bg-white text-blue-900 font-semibold px-6 py-3 rounded hover:bg-gray-100 transition-colors">Shop Products</a>
          <a href="/events" class="border border-white px-6 py-3 rounded hover:bg-white hover:text-blue-900 transition-colors">View Events</a>
        </div>
      </div>
    </section>


    <!-- Welcome to Skyscraper Comics Section -->
    <section class="px-6 py-20 bg-white">
      <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold mb-4 text-gray-900">Your Local Comic Store &amp; Gaming Hub</h2>
          <p class="text-gray-600 mb-4 leading-relaxed">
            Skyscraper Comics has been serving the local community with a passion for comics,
            gaming, and collectibles. Whether you're a lifelong collector or just starting your
            journey, our knowledgeable staff is here to help you find exactly what you're looking for.
          </p>
          <p class="text-gray-600 mb-6 leading-relaxed">
            From the latest Marvel and DC releases to rare back issues, from Magic: The Gathering
            booster packs to Yu-Gi-Oh! singles — we supply it all.
          </p>
          <a href="/products" class="inline-block bg-blue-900 text-white px-6 py-3 rounded hover:bg-blue-800 transition-colors font-semibold">
            Browse Our Collection
          </a>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-blue-50 rounded-xl p-6 text-center">
            <p class="text-4xl font-bold text-blue-900 mb-1">10K+</p>
            <p class="text-gray-600 text-sm font-medium">Comics In Stock</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-6 text-center">
            <p class="text-4xl font-bold text-blue-900 mb-1">50+</p>
            <p class="text-gray-600 text-sm font-medium">Weekly Events</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-6 text-center">
            <p class="text-4xl font-bold text-blue-900 mb-1">500+</p>
            <p class="text-gray-600 text-sm font-medium">Card Game Singles</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-6 text-center">
            <p class="text-4xl font-bold text-blue-900 mb-1">5★</p>
            <p class="text-gray-600 text-sm font-medium">Customer Rating</p>
          </div>
        </div>
      </div>
    </section>
<section class="px-6 pt-10 pb-10 bg-gray-100">
  <div class="max-w-screen-xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center text-[#0f172a] mb-12">
      Why Shop With Us
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-10 text-center">
      
      <div class="flex flex-col items-center max-w-[280px] mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <img src="/images/icons/shopping-bag.svg" alt="Shopping bag icon" class="w-7 h-7" />
        </div>
        <h3 class="text-2xl font-bold text-[#0f172a] mb-3">Vast Selection</h3>
        <p class="text-gray-600 text-base leading-8">
          Browse thousands of comics and trading cards from all major publishers.
        </p>
      </div>

      <div class="flex flex-col items-center max-w-[280px] mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <img src="/images/icons/calendar.svg" alt="Calendar icon" class="w-7 h-7" />
        </div>
        <h3 class="text-2xl font-bold text-[#0f172a] mb-3">Weekly Events</h3>
        <p class="text-gray-600 text-base leading-8">
          Join us for game nights, tournaments, and special release events every week.
        </p>
      </div>

      <div class="flex flex-col items-center max-w-[280px] mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <img src="/images/icons/users.svg" alt="Users icon" class="w-7 h-7" />
        </div>
        <h3 class="text-2xl font-bold text-[#0f172a] mb-3">Community</h3>
        <p class="text-gray-600 text-base leading-8">
          Connect with fellow collectors and players in a friendly environment.
        </p>
      </div>

      <div class="flex flex-col items-center max-w-[280px] mx-auto">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <img src="/images/icons/trophy.svg" alt="Trophy icon" class="w-7 h-7" />
        </div>
        <h3 class="text-2xl font-bold text-[#0f172a] mb-3">Tournaments</h3>
        <p class="text-gray-600 text-base leading-8">
          Compete in organized play for Magic, Pokemon, Yu-Gi-Oh!, and more.
        </p>
      </div>

    </div>
  </div>
</section>

    <!-- Featured Categories -->
<section class="px-6 py-16 bg-white">
  <h2 class="text-3xl font-bold text-center mb-10">Featured Categories</h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
    <RouterLink to="/products" class="group">
      <div class="relative h-72 rounded-2xl overflow-hidden shadow-md">
        <img
          src="/images/logo/comic-books.jpg"
          alt="Comic Books"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/35 group-hover:bg-black/40 transition"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div class="absolute bottom-6 left-6 text-white">
          <h3 class="text-2xl font-bold mb-2">Comic Books</h3>
          <p class="text-white/90">New releases, back issues, and rare finds</p>
        </div>
      </div>
    </RouterLink>

    <RouterLink to="/products" class="group">
      <div class="relative h-72 rounded-2xl overflow-hidden shadow-md">
        <img
          src="/images/logo/trading-cards.jpg"
          alt="Trading Cards"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/35 group-hover:bg-black/40 transition"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div class="absolute bottom-6 left-6 text-white">
          <h3 class="text-2xl font-bold mb-2">Trading Cards</h3>
          <p class="text-white/90">Magic, Pokemon, Yu-Gi-Oh!, and more</p>
        </div>
      </div>
    </RouterLink>
  </div>
</section>

    <!-- Upcoming Events -->
    <section class="px-6 py-16 bg-gray-100">
      <h2 class="text-3xl font-bold text-center mb-10">Upcoming Events</h2>
      <div class="max-w-2xl mx-auto flex flex-col gap-4 mb-8">
        <div v-for="event in events" :key="event.title" class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="font-bold text-lg">{{ event.title }}</h3>
          <p class="text-gray-600 text-sm">{{ event.desc }}</p>
          <p class="text-gray-500 text-sm mt-1">{{ event.time }}</p>
        </div>
      </div>
      <div class="text-center">
        <a href="/events" class="bg-blue-900 text-white px-8 py-3 rounded hover:bg-blue-800 transition-colors">View Full Calendar</a>
      </div>
    </section>

    

  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const events = [
  { title: 'Dummy Event #1', desc: 'Standard format tournament. Entry fee: $5', time: 'Mar 7 | 7:00 PM - 10:00 PM' },
  { title: 'Dummy Event #2', desc: 'Casual play and trading session for all ages', time: 'Mar 8 | 2:00 PM - 5:00 PM' },
]
</script>
