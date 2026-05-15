<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="container mx-auto px-6">
      <h1 class="text-4xl font-bold text-center mb-8 text-gray-900">Admin Dashboard</h1>
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold mb-6">Admin Login</h2>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@skyscrapercomics.com"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>
          <div class="mt-6 text-center">
            <RouterLink to="/" class="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = () => {
  // Simple demo login - in a real app, this would authenticate with a backend
  if (email.value === 'admin@skyscrapercomics.com' && password.value === 'admin123') {
    alert('Login successful! (This is a demo)')
    // In a real app, you'd redirect to the actual admin dashboard
  } else {
    alert('Invalid credentials. Try admin@skyscrapercomics.com / admin123')
  }
}
</script>