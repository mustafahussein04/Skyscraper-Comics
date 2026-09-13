<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-gray-950/60 lg:hidden"
      aria-hidden="true"
      @click="closeMobileMenu"
    ></div>

    <aside
      id="admin-sidebar"
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-blue-950 text-white shadow-xl transition-transform duration-300 lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <img
          src="/images/logo/Skyscraper_Logo.png"
          alt="Skyscraper Comics"
          class="h-11 w-11 rounded-lg object-cover"
        />
        <div>
          <p class="font-bold leading-tight">Skyscraper Comics</p>
          <p class="text-xs font-semibold uppercase tracking-widest text-violet-300">Admin</p>
        </div>
      </div>

      <nav class="flex-1 space-y-2 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
            isItemActive(item.path)
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/20'
              : 'text-blue-100 hover:bg-white/10 hover:text-white',
          ]"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-white/10 p-4">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
          @click="handleLogout"
        >
          <LogOut class="h-5 w-5" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header
        class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-controls="admin-sidebar"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Toggle admin navigation"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <Menu class="h-6 w-6" aria-hidden="true" />
          </button>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-violet-600">Admin Portal</p>
            <h1 class="text-lg font-bold text-gray-900 sm:text-xl">{{ currentPageTitle }}</h1>
          </div>
        </div>
        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          Demo session
        </span>
      </header>

      <main class="p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-vue-next'
import { signOutAdmin } from '@/composables/useAdminAuth'

const route = useRoute()
const router = useRouter()
const isMobileMenuOpen = ref(false)

const navigationItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Events', path: '/admin/events', icon: CalendarDays },
  { label: 'Customers', path: '/admin/customers', icon: Users },
]

const currentPageTitle = computed(() => String(route.meta.title ?? 'Dashboard'))

const isItemActive = (path: string) =>
  path === '/admin' ? route.path === path : route.path.startsWith(path)

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  signOutAdmin()
  await router.replace('/admin/login')
}
</script>
