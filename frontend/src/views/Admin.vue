<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-violet-800 px-6 py-12"
  >
    <div class="w-full max-w-md">
      <RouterLink
        to="/"
        class="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-white"
      >
        <span aria-hidden="true">&larr;</span>
        Back to Store
      </RouterLink>

      <section class="overflow-hidden rounded-2xl bg-white shadow-2xl" aria-labelledby="admin-title">
        <div class="border-b border-violet-100 bg-violet-50 px-8 py-6">
          <div class="flex items-center gap-4">
            <img
              src="/images/logo/Skyscraper_Logo.png"
              alt="Skyscraper Comics"
              class="h-14 w-14 rounded-lg object-cover"
            />
            <div>
              <p class="text-sm font-semibold uppercase tracking-widest text-violet-700">
                Staff access
              </p>
              <h1 id="admin-title" class="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>
          </div>
        </div>

        <div class="px-8 py-8">
          <p class="mb-6 text-sm text-gray-600">
            Sign in with your administrator credentials. This area is for authorized staff only.
          </p>

          <p class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo access: enter any valid email and a non-empty password.
          </p>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="username"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                autocomplete="current-password"
                class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200"
            >
              Sign in to Admin Portal
            </button>

          </form>
        </div>
      </section>

      <p class="mt-6 text-center text-xs text-blue-200">
        Skyscraper Comics secure administration
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInAdmin } from '@/composables/useAdminAuth'

defineOptions({ name: 'AdminLogin' })

const email = ref('')
const password = ref('')
const route = useRoute()
const router = useRouter()

const handleLogin = async () => {
  signInAdmin()
  const requestedRoute = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
  const destination = requestedRoute.startsWith('/admin') ? requestedRoute : '/admin'
  await router.replace(destination)
}
</script>
