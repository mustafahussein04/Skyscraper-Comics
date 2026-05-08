<template>
  <div class="min-h-screen bg-white">

    <!-- Page Header -->
    <div class="px-6 pt-10 pb-6 max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 mb-1">Events Calendar</h1>
      <p class="text-blue-600 text-sm">Join us for tournaments, game nights, and special events</p>
    </div>

    <!-- Two-column layout: calendar placeholder left, upcoming events right -->
    <div class="max-w-6xl mx-auto px-6 pb-16 flex gap-8 items-start">

      <!-- Calendar placeholder (will be implemented later) -->
      <div class="flex-1 min-h-[520px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-gray-200">
        Calendar
      </div>

      <!-- Upcoming Events Sidebar -->
      <div class="w-72 flex-shrink-0 border border-gray-200 rounded-lg p-5">
        <h2 class="text-lg font-bold text-gray-900 mb-5">Upcoming Events</h2>
        <div class="flex flex-col gap-5">
          <div v-for="event in events" :key="event.title + event.day" class="flex gap-3 items-start">

            <!-- Date Badge -->
            <div class="flex-shrink-0 bg-blue-900 text-white rounded text-center w-14 py-2 leading-none">
              <div class="text-2xl font-bold">{{ event.day }}</div>
              <div class="text-xs uppercase tracking-wide mt-1">{{ event.month }}</div>
            </div>

            <!-- Event Info -->
            <div>
              <p class="font-bold text-gray-900 text-sm leading-snug">{{ event.title }}</p>
              <p class="text-gray-500 text-xs mt-0.5">{{ event.time }}</p>
              <p class="text-gray-400 text-xs">{{ event.category }}</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const events = [
  { day: '6',  month: 'MAR', title: 'Friday Night Magic',    time: '7:00 PM - 10:00 PM', category: 'Magic: The Gathering' },
  { day: '7',  month: 'MAR', title: 'Friday Night Magic',    time: '7:00 PM - 10:00 PM', category: 'Magic: The Gathering' },
  { day: '8',  month: 'MAR', title: 'Pokemon League',        time: '2:00 PM - 5:00 PM',  category: 'Pokemon TCG' },
  { day: '10', month: 'MAR', title: 'Commander Night',       time: '6:00 PM - 10:00 PM', category: 'Magic: The Gathering' },
  { day: '12', month: 'MAR', title: 'Yu-Gi-Oh! Tournament',  time: '6:00 PM - 9:00 PM',  category: 'Yu-Gi-Oh!' },
  { day: '13', month: 'MAR', title: 'New Comic Book Day',    time: 'All Day',             category: 'Store Event' },
]
</script>
