<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="container mx-auto px-6">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-900">Our Products</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Product cards will go here -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-bold mb-2">Comic Books</h3>
          <p class="text-gray-600 mb-4">Browse our extensive collection of comic books</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Details
          </button>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-6xl mb-4">🎴</div>
          <h3 class="text-xl font-bold mb-2">Trading Cards</h3>
          <p class="text-gray-600 mb-4">Rare and collectible trading cards</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Details
          </button>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="text-6xl mb-4">🏆</div>
          <h3 class="text-xl font-bold mb-2">Collectibles</h3>
          <p class="text-gray-600 mb-4">Statues, figures, and memorabilia</p>
          <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Products page component
</script>